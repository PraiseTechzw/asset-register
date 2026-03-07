import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, requireRole, ROLES } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);
        const roleError = requireRole(user, [ROLES.SUPER_ADMIN]);
        if (roleError) return roleError;

        const dbPath = path.join(process.cwd(), "dev.db");

        if (!fs.existsSync(dbPath)) {
            return NextResponse.json({ error: "Database file not found" }, { status: 404 });
        }

        const fileBuffer = fs.readFileSync(dbPath);

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": "application/x-sqlite3",
                "Content-Disposition": `attachment; filename="asset-node-backup-${new Date().toISOString().split('T')[0]}.db"`,
            },
        });
    } catch (error) {
        console.error("Backup Error:", error);
        return NextResponse.json({ error: "Failed to generate backup" }, { status: 500 });
    }
}
