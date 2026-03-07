import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, requireRole, ROLES } from "@/lib/auth";
import { logActivity } from "@/lib/logger";
import { z } from "zod";

const createMovementSchema = z.object({
    assetId: z.string().min(1, "Asset ID is required"),
    toDepartmentId: z.string().min(1, "Destination Department ID is required"),
    notes: z.string().optional()
});

export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);
        // Anyone except AUDITOR can initiate a transfer (e.g. DEPT_OFFICER, ASSET_CONTROLLER, SUPER_ADMIN)
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (user.role === ROLES.AUDITOR) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const body = await req.json();
        const result = createMovementSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 });
        }

        const { assetId, toDepartmentId, notes } = result.data;

        // Verify Asset exists and user has permission to transfer it
        const asset = await prisma.asset.findUnique({ where: { id: assetId } });
        if (!asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

        if (user.role === ROLES.DEPT_OFFICER && asset.currentDepartmentId !== user.departmentId) {
            return NextResponse.json({ error: "Forbidden: Not your department's asset" }, { status: 403 });
        }

        if (asset.currentDepartmentId === toDepartmentId) {
            return NextResponse.json({ error: "Asset is already in this department" }, { status: 400 });
        }

        // Verify Destination Department exists
        const toDepartment = await prisma.department.findUnique({ where: { id: toDepartmentId } });
        if (!toDepartment) return NextResponse.json({ error: "Destination department not found" }, { status: 404 });

        const movement = await prisma.assetMovement.create({
            data: {
                assetId,
                fromDepartmentId: asset.currentDepartmentId,
                toDepartmentId,
                requestedById: user.userId,
                status: "PENDING",
                notes
            }
        });

        await logActivity({
            action: "MOVEMENT_REQUESTED",
            entityType: "ASSET_MOVEMENT",
            entityId: movement.id,
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

        const whereClause: any = {};
        if (status) whereClause.status = status;

        // DEPT_OFFICER only sees movements related to their department (from or to)
        if (user.role === ROLES.DEPT_OFFICER && user.departmentId) {
            whereClause.OR = [
                { fromDepartmentId: user.departmentId },
                { toDepartmentId: user.departmentId }
            ];
        } else if (departmentId) {
            whereClause.OR = [
                { fromDepartmentId: departmentId },
                { toDepartmentId: departmentId }
            ];
        }

        const movements = await prisma.assetMovement.findMany({
            where: whereClause,
            include: {
                asset: true,
                fromDepartment: true,
                toDepartment: true,
                requestedBy: { select: { name: true, email: true } },
                approvedBy: { select: { name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(movements, { status: 200 });

    } catch (error) {
        console.error("Get Movements Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
