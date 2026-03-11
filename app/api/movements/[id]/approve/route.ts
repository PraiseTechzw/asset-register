import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserFromRequest, ROLES } from "@/lib/auth";
import { logActivity } from "@/lib/logger";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getUserFromRequest(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const { status } = await req.json(); // Expected: APPROVED or REJECTED

        if (!["APPROVED", "REJECTED"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const movementResult = await db.execute({
            sql: "SELECT * FROM AssetMovement WHERE id = ?",
            args: [id]
        });
        const movement = movementResult.rows[0] as any;

        if (!movement) return NextResponse.json({ error: "Movement request not found" }, { status: 404 });
        if (movement.status !== "PENDING") {
            return NextResponse.json({ error: "Only PENDING movements can be modified" }, { status: 400 });
        }

        // Role check: Only ASSET_CONTROLLER, SUPER_ADMIN, or the DESTINATION DEPT_OFFICER can approve
        const canApprove =
            user.role === ROLES.SUPER_ADMIN ||
            user.role === ROLES.ASSET_CONTROLLER ||
            (user.role === ROLES.DEPT_OFFICER && user.departmentId === movement.toDepartmentId);

        if (!canApprove) {
            return NextResponse.json({ error: "Forbidden: You cannot approve this movement" }, { status: 403 });
        }

        const batch: any[] = [
            {
                sql: "UPDATE AssetMovement SET status = ?, approvedById = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
                args: [status, user.userId, id]
            }
        ];

        if (status === "APPROVED") {
            batch.push({
                sql: "UPDATE Asset SET currentDepartmentId = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
                args: [movement.toDepartmentId, movement.assetId]
            });
        }

        await db.batch(batch, "write");

        const updatedMovementRes = await db.execute({
            sql: "SELECT * FROM AssetMovement WHERE id = ?",
            args: [id]
        });
        const updatedMovement = updatedMovementRes.rows[0];

        await logActivity({
            action: status === "APPROVED" ? "MOVEMENT_APPROVED" : "MOVEMENT_REJECTED",
            entityType: "ASSET_MOVEMENT",
            entityId: id,
            userId: user.userId,
            details: { assetId: movement.assetId, newStatus: status },
            req,
        });

        return NextResponse.json(updatedMovement, { status: 200 });

    } catch (error) {
        console.error("Approve Movement Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
