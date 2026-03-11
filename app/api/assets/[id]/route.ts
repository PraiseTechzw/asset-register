import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
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
        const assetResult = await db.execute({
            sql: `
                SELECT a.*, d.name as departmentName, u.name as assignedUserName, v.method, v.rate, v.currentBookValue
                FROM Asset a
                LEFT JOIN Department d ON a.currentDepartmentId = d.id
                LEFT JOIN User u ON a.assignedUserId = u.id
                LEFT JOIN Valuation v ON v.assetId = a.id
                WHERE a.id = ?
            `,
            args: [id]
        });
        const asset = assetResult.rows[0] as any;

        if (!asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

        // Add dummy locations for now if needed or fetch them
        const locationsResult = await db.execute({
            sql: "SELECT * FROM AssetLocation WHERE assetId = ? ORDER BY recordedAt DESC LIMIT 5",
            args: [id]
        });
        asset.locations = locationsResult.rows;

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
        const existingAssetResult = await db.execute({
            sql: "SELECT * FROM Asset WHERE id = ?",
            args: [id]
        });
        const existingAsset = existingAssetResult.rows[0] as any;
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

        // Build dynamic UPDATE
        const keys = Object.keys(updateData).filter(k => (updateData as any)[k] !== undefined);
        if (keys.length > 0) {
            const setClause = keys.map(k => `${k} = ?`).join(", ");
            const values = keys.map(k => (updateData as any)[k]);
            await db.execute({
                sql: `UPDATE Asset SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
                args: [...values, id]
            });
        }

        const updatedAssetResult = await db.execute({
            sql: "SELECT * FROM Asset WHERE id = ?",
            args: [id]
        });
        const updatedAsset = updatedAssetResult.rows[0];

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
