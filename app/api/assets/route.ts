import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserFromRequest, requireRole, ROLES } from "@/lib/auth";
import { logActivity } from "@/lib/logger";
import { z } from "zod";
import crypto from "crypto";

const createAssetSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    purchaseDate: z.string().datetime(),
    purchasePrice: z.number().min(0),
    currentDepartmentId: z.string().optional(),
    condition: z.string().optional(),
    valuationMethod: z.string().optional(),
    valuationRate: z.number().optional()
});

export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);
        const roleError = requireRole(user, [ROLES.SUPER_ADMIN, ROLES.ASSET_CONTROLLER]);
        if (roleError) return roleError;

        const body = await req.json();
        const result = createAssetSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 });
        }

        const data = result.data;
        const qrCodeHash = crypto.randomBytes(16).toString("hex");
        const assetId = crypto.randomUUID();

        const createAsset = db.transaction(() => {
            db.prepare(`
                INSERT INTO Asset (id, name, description, category, purchaseDate, purchasePrice, currentDepartmentId, condition, qrCodeHash, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
            `).run(assetId, data.name, data.description || null, data.category, data.purchaseDate, data.purchasePrice, data.currentDepartmentId || null, data.condition || "GOOD", qrCodeHash);

            db.prepare(`
                INSERT INTO Valuation (id, assetId, method, rate, accumulatedDepreciation, currentBookValue)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(crypto.randomUUID(), assetId, data.valuationMethod || "STRAIGHT_LINE", data.valuationRate || 5, 0, data.purchasePrice);

            return db.prepare("SELECT * FROM Asset WHERE id = ?").get(assetId) as any;
        });

        const newAsset = createAsset();

        await logActivity({
            action: "ASSET_CREATED",
            entityType: "ASSET",
            entityId: newAsset.id,
            userId: user!.userId,
            details: { name: newAsset.name, category: newAsset.category },
            req,
        });

        return NextResponse.json(newAsset, { status: 201 });
    } catch (error) {
        console.error("Create Asset Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const departmentId = searchParams.get("departmentId");
        const status = searchParams.get("status");
        const category = searchParams.get("category");

        let query = `
            SELECT a.*, d.name as departmentName, v.method, v.currentBookValue 
            FROM Asset a
            LEFT JOIN Department d ON a.currentDepartmentId = d.id
            LEFT JOIN Valuation v ON v.assetId = a.id
            WHERE 1=1
        `;
        const params: any[] = [];

        if (departmentId) {
            query += " AND a.currentDepartmentId = ?";
            params.push(departmentId);
        }
        if (status) {
            query += " AND a.status = ?";
            params.push(status);
        }
        if (category) {
            query += " AND a.category = ?";
            params.push(category);
        }

        if (user.role === ROLES.DEPT_OFFICER && user.departmentId) {
            query += " AND a.currentDepartmentId = ?";
            params.push(user.departmentId);
        }

        query += " ORDER BY a.createdAt DESC";

        const assets = db.prepare(query).all(...params);

        return NextResponse.json(assets, { status: 200 });
    } catch (error) {
        console.error("Get Assets Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
