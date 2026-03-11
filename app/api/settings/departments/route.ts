import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserFromRequest, requireRole, ROLES } from "@/lib/auth";
import crypto from "crypto";

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const departmentsRes = await db.execute(`SELECT * FROM Department ORDER BY name ASC`);
        const departments = departmentsRes.rows as any[];

        return NextResponse.json({ departments }, { status: 200 });
    } catch (error) {
        console.error("Fetch Departments Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);
        const roleError = requireRole(user, [ROLES.SUPER_ADMIN]);
        if (roleError) return roleError;

        const body = await req.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ error: "Department name is required" }, { status: 400 });
        }

        const existingDeptRes = await db.execute({
            sql: "SELECT id FROM Department WHERE name = ?",
            args: [name]
        });
        const existingDept = existingDeptRes.rows[0];
        if (existingDept) {
            return NextResponse.json({ error: "Department already exists" }, { status: 400 });
        }

        const id = crypto.randomUUID();

        await db.execute({
            sql: `
                INSERT INTO Department (id, name)
                VALUES (?, ?)
            `,
            args: [id, name]
        });

        return NextResponse.json({ message: "Department created successfully", department: { id, name } }, { status: 201 });
    } catch (error) {
        console.error("Create Department Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
