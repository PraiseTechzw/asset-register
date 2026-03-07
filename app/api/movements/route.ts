import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserFromRequest, ROLES } from "@/lib/auth";
import { logActivity } from "@/lib/logger";
import { z } from "zod";
import crypto from "crypto";

const createMovementSchema = z.object({
    assetId: z.string().min(1, "Asset ID is required"),
    toDepartmentId: z.string().min(1, "Destination Department ID is required"),
    notes: z.string().optional()
});

export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (user.role === ROLES.AUDITOR) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const body = await req.json();
        const result = createMovementSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 });
        }

        const { assetId, toDepartmentId, notes } = result.data;

        const asset = db.prepare("SELECT * FROM Asset WHERE id = ?").get(assetId) as any;
        if (!asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

        if (user.role === ROLES.DEPT_OFFICER && asset.currentDepartmentId !== user.departmentId) {
            return NextResponse.json({ error: "Forbidden: Not your department's asset" }, { status: 403 });
        }

        if (asset.currentDepartmentId === toDepartmentId) {
            return NextResponse.json({ error: "Asset is already in this department" }, { status: 400 });
        }

        const toDepartment = db.prepare("SELECT * FROM Department WHERE id = ?").get(toDepartmentId);
        if (!toDepartment) return NextResponse.json({ error: "Destination department not found" }, { status: 404 });

        const movementId = crypto.randomUUID();
        db.prepare(`
            INSERT INTO AssetMovement (id, assetId, fromDepartmentId, toDepartmentId, requestedById, status, notes)
            VALUES (?, ?, ?, ?, ?, 'PENDING', ?)
        `).run(movementId, assetId, asset.currentDepartmentId, toDepartmentId, user.userId, notes || null);

        const movement = db.prepare("SELECT * FROM AssetMovement WHERE id = ?").get(movementId);

        await logActivity({
            action: "MOVEMENT_REQUESTED",
            entityType: "ASSET_MOVEMENT",
            entityId: movementId,
            userId: user.userId,
            details: { assetId, from: asset.currentDepartmentId, to: toDepartmentId },
            req,
        });

        return NextResponse.json(movement, { status: 201 });

    } catch (error) {
        console.error("Create Movement Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const departmentId = searchParams.get("departmentId");
        const status = searchParams.get("status");

        let query = `
            SELECT m.*, a.name as assetName, fd.name as fromDeptName, td.name as toDeptName,
                   ru.name as requestedByName, ru.email as requestedByEmail,
                   au.name as approvedByName, au.email as approvedByEmail
            FROM AssetMovement m
            JOIN Asset a ON m.assetId = a.id
            LEFT JOIN Department fd ON m.fromDepartmentId = fd.id
            JOIN Department td ON m.toDepartmentId = td.id
            JOIN User ru ON m.requestedById = ru.id
            LEFT JOIN User au ON m.approvedById = au.id
            WHERE 1=1
        `;
        const params: any[] = [];

        if (status) {
            query += " AND m.status = ?";
            params.push(status);
        }

        if (user.role === ROLES.DEPT_OFFICER && user.departmentId) {
            query += " AND (m.fromDepartmentId = ? OR m.toDepartmentId = ?)";
            params.push(user.departmentId, user.departmentId);
        } else if (departmentId) {
            query += " AND (m.fromDepartmentId = ? OR m.toDepartmentId = ?)";
            params.push(departmentId, departmentId);
        }

        query += " ORDER BY m.createdAt DESC";

        const movements = db.prepare(query).all(...params);

        return NextResponse.json(movements, { status: 200 });

    } catch (error) {
        console.error("Get Movements Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
