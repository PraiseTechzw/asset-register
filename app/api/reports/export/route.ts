import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const assets = db.prepare(`
            SELECT a.id, a.name, a.category, d.name as department, a.status, a.condition, a.purchasePrice, a.purchaseDate
            FROM Asset a
            LEFT JOIN Department d ON a.currentDepartmentId = d.id
        `).all() as any[];

        const csvRows = [
            ["ID", "Name", "Category", "Department", "Status", "Condition", "Purchase Price", "Purchase Date"].join(",")
        ];

        assets.forEach(a => {
            csvRows.push([
                a.id,
                `"${a.name}"`,
                a.category,
                a.department || "N/A",
                a.status,
                a.condition,
                a.purchasePrice,
                a.purchaseDate
            ].join(","));
        });

        const csvContent = csvRows.join("\n");

        return new NextResponse(csvContent, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": 'attachment; filename="asset-report.csv"'
            }
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
    }
}
