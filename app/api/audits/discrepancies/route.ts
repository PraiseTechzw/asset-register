import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserFromRequest, requireRole, ROLES } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);
        const roleError = requireRole(user, [ROLES.SUPER_ADMIN, ROLES.AUDITOR]);
        if (roleError) return roleError;

        const { searchParams } = new URL(req.url);
        const daysUnscanned = parseInt(searchParams.get("days") || "30", 10);

        // Find Date X days ago
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - daysUnscanned);
        const thresholdISO = thresholdDate.toISOString();

        // 1. Find assets that have never been scanned or haven't been scanned recently
        const unscannedAssetsRes = await db.execute({
            sql: `
                SELECT a.*, d.name as departmentName
                FROM Asset a
                LEFT JOIN Department d ON a.currentDepartmentId = d.id
                WHERE a.status = 'ACTIVE' 
                AND a.id NOT IN (
                    SELECT entityId FROM AuditLog 
                    WHERE action = 'QR_SCANNED' 
                    AND entityType = 'ASSET' 
                    AND timestamp >= ?
                )
            `,
            args: [thresholdISO]
        });
        const unscannedAssets = unscannedAssetsRes.rows as any[];

        // 2. Find assets explicitly marked as MISSING
        const missingAssetsRes = await db.execute(`
            SELECT a.*, d.name as departmentName
            FROM Asset a
            LEFT JOIN Department d ON a.currentDepartmentId = d.id
            WHERE a.status = 'MISSING'
        `);
        const missingAssets = missingAssetsRes.rows as any[];

        // 3. Find assets in conditions POOR or SCRAP but still ACTIVE
        const conditionDiscrepanciesRes = await db.execute(`
            SELECT a.*, d.name as departmentName
            FROM Asset a
            LEFT JOIN Department d ON a.currentDepartmentId = d.id
            WHERE a.status = 'ACTIVE' AND a.condition IN ('POOR', 'SCRAP')
        `);
        const conditionDiscrepancies = conditionDiscrepanciesRes.rows as any[];

        return NextResponse.json({
            discrepancies: {
                unscannedCount: unscannedAssets.length,
                unscanned: unscannedAssets,
                missingCount: missingAssets.length,
                missing: missingAssets,
                conditionCount: conditionDiscrepancies.length,
                conditionDiscrepancies: conditionDiscrepancies
            },
            thresholdDays: daysUnscanned,
            generatedAt: new Date()
        }, { status: 200 });

    } catch (error) {
        console.error("Audits Discrepancies Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
