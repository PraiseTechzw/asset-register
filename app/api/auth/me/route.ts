import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const payload = await getUserFromRequest(req);
        if (!payload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = db.prepare("SELECT id, name, email, role, departmentId FROM User WHERE id = ?").get(payload.userId) as any;

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Aggregate some essential notification counts
        const pendingMovements = (db.prepare("SELECT COUNT(*) as count FROM AssetMovement WHERE status = 'PENDING'").get() as any).count;
        const criticalAssets = (db.prepare("SELECT COUNT(*) as count FROM Asset WHERE status = 'MISSING' OR condition = 'SCRAP'").get() as any).count;

        return NextResponse.json({
            user,
            notifications: {
                total: pendingMovements + criticalAssets,
                pendingMovements,
                criticalAssets
            }
        });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
