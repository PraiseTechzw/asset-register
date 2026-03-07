import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, requireRole, ROLES } from "@/lib/auth";
import { logActivity } from "@/lib/logger";

export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);
        const roleError = requireRole(user, [ROLES.SUPER_ADMIN, ROLES.AUDITOR, ROLES.ASSET_CONTROLLER]);
        if (roleError) return roleError;

        // Fetch all assets with their valuations
        const assets = await prisma.asset.findMany({
            include: {
                valuation: true,
            }
        });

        const now = new Date();
        let updatedCount = 0;

        for (const asset of assets) {
            if (!asset.valuation) continue;

            const val = asset.valuation;
            const purchasePrice = asset.purchasePrice;

            // Calculate years elapsed (can be fractional)
            const yearsElapsed = (now.getTime() - asset.purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

            let currentBookValue = purchasePrice;
            let accumulatedDepreciation = 0;

            if (val.method === "STRAIGHT_LINE") {
                const lifespanYears = val.rate; // Assuming rate represents total lifespan years
                const annualDepreciation = purchasePrice / lifespanYears;

                accumulatedDepreciation = annualDepreciation * yearsElapsed;
                if (accumulatedDepreciation > purchasePrice) accumulatedDepreciation = purchasePrice; // Cannot depreciate below 0

                currentBookValue = purchasePrice - accumulatedDepreciation;
            } else if (val.method === "REDUCING_BALANCE") {
                const depreciationRate = val.rate; // Fraction, e.g. 0.2 for 20%
                currentBookValue = purchasePrice * Math.pow((1 - depreciationRate), Math.floor(yearsElapsed));
                accumulatedDepreciation = purchasePrice - currentBookValue;
            }

            // Ensure values are not negative
            if (currentBookValue < 0) currentBookValue = 0;

            // Update the valuation record
            await prisma.valuation.update({
                where: { id: val.id },
                data: {
                    accumulatedDepreciation,
                    currentBookValue,
                    lastCalculatedAt: now,
                }
            });

            updatedCount++;
        }

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

        const valuations = await prisma.valuation.findMany({
            include: {
                asset: {
                    include: {
                        currentDepartment: true,
                    }
                }
            },
            orderBy: { lastCalculatedAt: 'desc' },
            take: 100 // Limit for performance or implement pagination
        });

        return NextResponse.json(valuations, { status: 200 });
    } catch (error) {
        console.error("Get Valuations Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
