import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

        const movement = await prisma.assetMovement.findUnique({
            where: { id },
            include: { asset: true }
        });

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

        // Update Movement
        const updatedMovement = await prisma.assetMovement.update({
            where: { id },
            data: {
                status,
                approvedById: user.userId,
            }
        });

        // If APPROVED, update the Asset's currentDepartmentId
        if (status === "APPROVED") {
            await prisma.asset.update({
                where: { id: movement.assetId },
                data: { currentDepartmentId: movement.toDepartmentId }
            });
        }

        await logActivity({
            action: status === "APPROVED" ? "MOVEMENT_APPROVED" : "MOVEMENT_REJECTED",
            entityType: "ASSET_MOVEMENT",
            entityId: movement.id,
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
