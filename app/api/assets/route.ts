import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, requireRole, ROLES } from "@/lib/auth";
import { logActivity } from "@/lib/logger";
import { z } from "zod";
import crypto from "crypto";

const createAssetSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    purchaseDate: z.string().datetime(),
    purchasePrice: z.number().min(0),
    currentDepartmentId: z.string().optional(),
    condition: z.string().optional(), // EXCELLENT, GOOD, FAIR, POOR, SCRAP
    valuationMethod: z.string().optional(), // STRAIGHT_LINE, REDUCING_BALANCE
    valuationRate: z.number().optional() // Lifespan or percentage
});

export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);
        const roleError = requireRole(user, [ROLES.SUPER_ADMIN, ROLES.ASSET_CONTROLLER]);
        if (roleError) return roleError;

        const body = await req.json();
        const result = createAssetSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 });
        }

        const data = result.data;
        const qrCodeHash = crypto.randomBytes(16).toString("hex");

        const newAsset = await prisma.asset.create({
            data: {
                name: data.name,
                description: data.description,
                category: data.category,
                purchaseDate: new Date(data.purchaseDate),
                purchasePrice: data.purchasePrice,
                currentDepartmentId: data.currentDepartmentId || null,
                condition: data.condition || "GOOD",
                qrCodeHash,
                status: "ACTIVE",
                valuation: {
                    create: {
                        method: data.valuationMethod || "STRAIGHT_LINE",
                        rate: data.valuationRate || 5, // Default 5 years lifespan
                        accumulatedDepreciation: 0,
                        currentBookValue: data.purchasePrice
                    }
                }
            },
            include: {
                valuation: true
            }
        });

        await logActivity({
            action: "ASSET_CREATED",
            entityType: "ASSET",
            entityId: newAsset.id,
            userId: user!.userId,
            details: { name: newAsset.name, category: newAsset.category },
            req,
        });

        return NextResponse.json(newAsset, { status: 201 });
    } catch (error) {
        console.error("Create Asset Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const departmentId = searchParams.get("departmentId");
        const status = searchParams.get("status");
        const category = searchParams.get("category");

        const whereClause: any = {};
        if (departmentId) whereClause.currentDepartmentId = departmentId;
        if (status) whereClause.status = status;
        if (category) whereClause.category = category;

        // If Dept Officer, optionally restrict to their department (enforced here or skipped if viewing is open)
        if (user.role === ROLES.DEPT_OFFICER && user.departmentId) {
            whereClause.currentDepartmentId = user.departmentId;
        }

        const assets = await prisma.asset.findMany({
            where: whereClause,
            include: {
                currentDepartment: true,
                valuation: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(assets, { status: 200 });
    } catch (error) {
        console.error("Get Assets Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
