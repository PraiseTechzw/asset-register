import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const payload = await getUserFromRequest(req);
        if (!payload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userResult = await db.execute({
            sql: "SELECT id, name, email, role, departmentId FROM User WHERE id = ?",
            args: [payload.userId]
        });
        const user = userResult.rows[0] as any;

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Aggregate some essential notification counts
        const pendingMovementsRes = await db.execute("SELECT COUNT(*) as count FROM AssetMovement WHERE status = 'PENDING'");
        const pendingMovements = Number(pendingMovementsRes.rows[0].count);

        const criticalAssetsRes = await db.execute("SELECT COUNT(*) as count FROM Asset WHERE status = 'MISSING' OR condition = 'SCRAP'");
        const criticalAssets = Number(criticalAssetsRes.rows[0].count);

        const overdueMaintenanceRes = await db.execute("SELECT COUNT(*) as count FROM MaintenanceJob WHERE status = 'SCHEDULED' AND scheduledDate <= date('now')");
        const overdueMaintenance = Number(overdueMaintenanceRes.rows[0].count);

        return NextResponse.json({
            user,
            notifications: {
                total: pendingMovements + criticalAssets + overdueMaintenance,
                pendingMovements,
                criticalAssets,
                overdueMaintenance
            }
        });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
