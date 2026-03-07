import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserFromRequest, requireRole, ROLES } from "@/lib/auth";
import { logActivity } from "@/lib/logger";

export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);
        const roleError = requireRole(user, [ROLES.SUPER_ADMIN, ROLES.AUDITOR, ROLES.ASSET_CONTROLLER]);
        if (roleError) return roleError;

        // Fetch all assets with their valuations
        const assets = db.prepare(`
            SELECT a.*, v.id as valuationId, v.method, v.rate 
            FROM Asset a
            JOIN Valuation v ON v.assetId = a.id
        `).all() as any[];

        const now = new Date();
        const nowISO = now.toISOString();
        let updatedCount = 0;

        const updateValuations = db.transaction(() => {
            for (const asset of assets) {
                const purchaseDate = new Date(asset.purchaseDate);
                const yearsElapsed = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

                let currentBookValue = asset.purchasePrice;
                let accumulatedDepreciation = 0;

                if (asset.method === "STRAIGHT_LINE") {
                    const annualDepreciation = asset.purchasePrice / asset.rate;
                    accumulatedDepreciation = annualDepreciation * yearsElapsed;
                    if (accumulatedDepreciation > asset.purchasePrice) accumulatedDepreciation = asset.purchasePrice;
                    currentBookValue = asset.purchasePrice - accumulatedDepreciation;
                } else if (asset.method === "REDUCING_BALANCE") {
                    currentBookValue = asset.purchasePrice * Math.pow((1 - asset.rate), Math.floor(yearsElapsed));
                    accumulatedDepreciation = asset.purchasePrice - currentBookValue;
                }

                if (currentBookValue < 0) currentBookValue = 0;

                db.prepare(`
                    UPDATE Valuation 
                    SET accumulatedDepreciation = ?, currentBookValue = ?, lastCalculatedAt = ? 
                    WHERE id = ?
                `).run(accumulatedDepreciation, currentBookValue, nowISO, asset.valuationId);

                updatedCount++;
            }
        });

        updateValuations();

        await logActivity({
            action: "VALUATIONS_RECALCULATED",
            entityType: "SYSTEM",
            entityId: "SYSTEM",
            userId: user!.userId,
            details: { assetsProcessed: updatedCount },
            req,
        });

        return NextResponse.json({ message: `Recalculated ${updatedCount} assets`, timestamp: now }, { status: 200 });
    } catch (error) {
        console.error("Valuation Engine Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);
        const roleError = requireRole(user, [ROLES.SUPER_ADMIN, ROLES.AUDITOR, ROLES.ASSET_CONTROLLER]);
        if (roleError) return roleError;

        const valuations = db.prepare(`
            SELECT v.*, a.name as assetName, a.category as assetCategory, d.name as departmentName
            FROM Valuation v
            JOIN Asset a ON v.assetId = a.id
            LEFT JOIN Department d ON a.currentDepartmentId = d.id
            ORDER BY v.lastCalculatedAt DESC
            LIMIT 100
        `).all();

        return NextResponse.json(valuations, { status: 200 });
    } catch (error) {
        console.error("Get Valuations Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
