import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, requireRole, ROLES } from "@/lib/auth";
import { logActivity } from "@/lib/logger";
import { z } from "zod";

const updateAssetSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    condition: z.string().optional(),
    status: z.string().optional(),
    imageUrl: z.string().url().optional(),
    assignedUserId: z.string().nullable().optional(),
    currentDepartmentId: z.string().nullable().optional()
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getUserFromRequest(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const asset = await prisma.asset.findUnique({
            where: { id },
            include: {
                currentDepartment: true,
                assignedUser: true,
                valuation: true,
                locations: {
                    orderBy: { recordedAt: 'desc' },
                    take: 5
                }
            }
        });

        if (!asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

        // Check if DEPT_OFFICER can view
        if (user.role === ROLES.DEPT_OFFICER && asset.currentDepartmentId !== user.departmentId) {
            return NextResponse.json({ error: "Forbidden: Not in your department" }, { status: 403 });
        }

        return NextResponse.json(asset, { status: 200 });
    } catch (error) {
        console.error("Get Asset Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getUserFromRequest(req);
        const roleError = requireRole(user, [ROLES.SUPER_ADMIN, ROLES.ASSET_CONTROLLER, ROLES.DEPT_OFFICER]);
        if (roleError) return roleError;

        const { id } = await params;

        // Dept Officers can only update their own department's assets
        const existingAsset = await prisma.asset.findUnique({ where: { id } });
        if (!existingAsset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

        if (user!.role === ROLES.DEPT_OFFICER && existingAsset.currentDepartmentId !== user!.departmentId) {
            return NextResponse.json({ error: "Forbidden: Not in your department" }, { status: 403 });
        }

        const body = await req.json();
        const result = updateAssetSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 });
        }

        // Only SUPER_ADMIN/ASSET_CONTROLLER can change department directly (otherwise use Movement API)
        const updateData = { ...result.data };
        if (updateData.currentDepartmentId && user!.role === ROLES.DEPT_OFFICER) {
            delete updateData.currentDepartmentId; // Prevent direct transfer
        }

        const updatedAsset = await prisma.asset.update({
            where: { id },
            data: updateData
        });

        await logActivity({
            action: "ASSET_UPDATED",
            entityType: "ASSET",
            entityId: id,
            userId: user!.userId,
            details: updateData,
            req,
        });

        return NextResponse.json(updatedAsset, { status: 200 });
    } catch (error) {
        console.error("Update Asset Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
