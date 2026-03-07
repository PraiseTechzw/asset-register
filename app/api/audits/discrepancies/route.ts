import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

        // 1. Find assets that have never been scanned or haven't been scanned recently
        // An asset is considered "scanned" if there's an AssetLocation or AuditLog for QR_SCANNED.
        // For simplicity, we can check the AuditLog for QR_SCANNED events related to the Asset.

        // Using Prisma to find assets without recent scans.
        // We can do this by finding AuditLogs for recent QR_SCANNED events, then excluding those Asset IDs.
        const recentScans = await prisma.auditLog.findMany({
            where: {
                action: "QR_SCANNED",
                entityType: "ASSET",
                timestamp: { gte: thresholdDate }
            },
            select: { entityId: true }
        });
        const recentlyScannedAssetIds = recentScans.map(log => log.entityId);

        const unscannedAssets = await prisma.asset.findMany({
            where: {
                status: "ACTIVE",
                id: {
                    notIn: recentlyScannedAssetIds
                }
            },
            include: {
                currentDepartment: true,
            }
        });

        // 2. Find assets explicitly marked as MISSING
        const missingAssets = await prisma.asset.findMany({
            where: {
                status: "MISSING",
            },
            include: {
                currentDepartment: true,
            }
        });

        // 3. Find assets in conditions POOR or SCRAP but still ACTIVE
        const conditionDiscrepancies = await prisma.asset.findMany({
            where: {
                status: "ACTIVE",
                condition: {
                    in: ["POOR", "SCRAP"]
                }
            },
            include: {
                currentDepartment: true,
            }
        });

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
