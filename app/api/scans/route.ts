import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { logActivity } from "@/lib/logger";
import { z } from "zod";
import crypto from "crypto";

const scanAssetSchema = z.object({
    qrCodeHash: z.string().min(1, "QR Code is required"),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
    address: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const result = scanAssetSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 });
        }

        const { qrCodeHash, latitude, longitude, address } = result.data;

        const assetResult = await db.execute({
            sql: `
                SELECT a.*, d.name as departmentName
                FROM Asset a
                LEFT JOIN Department d ON a.currentDepartmentId = d.id
                WHERE a.qrCodeHash = ?
            `,
            args: [qrCodeHash]
        });
        const asset = assetResult.rows[0] as any;

        if (!asset) {
            // Log failed scan attempt
            await logActivity({
                action: "QR_SCAN_FAILED",
                entityType: "UNKNOWN",
                entityId: "UNKNOWN",
                userId: user.userId,
                details: { qrCodeHash, reason: "Asset not found" },
                req,
            });

            return NextResponse.json({ error: "Asset not found for this QR code" }, { status: 404 });
        }

        // Record the location if provided
        if (latitude && longitude) {
            await db.execute({
                sql: `
                    INSERT INTO AssetLocation (id, assetId, latitude, longitude, address, recordedById)
                    VALUES (?, ?, ?, ?, ?, ?)
                `,
                args: [crypto.randomUUID(), asset.id, latitude, longitude, address || null, user.userId]
            });
        }

        // Log the successful scan verification
        await logActivity({
            action: "QR_SCANNED",
            entityType: "ASSET",
            entityId: asset.id,
            userId: user.userId,
            details: {
                assetName: asset.name,
                locationRecorded: !!(latitude && longitude),
                departmentId: asset.currentDepartmentId,
            },
            req,
        });

        return NextResponse.json({
            message: "Asset verified successfully",
            asset: {
                id: asset.id,
                name: asset.name,
                status: asset.status,
                condition: asset.condition,
                department: asset.departmentName,
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Scan API Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
