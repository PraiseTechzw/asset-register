import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserFromRequest, requireRole, ROLES } from "@/lib/auth";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);
        const roleError = requireRole(user, [ROLES.SUPER_ADMIN]);
        if (roleError) return roleError;

        const users = db.prepare(`
            SELECT u.id, u.name, u.email, u.role, u.departmentId, d.name as deptName 
            FROM User u 
            LEFT JOIN Department d ON u.departmentId = d.id
            ORDER BY u.name ASC
        `).all() as any[];

        return NextResponse.json({ users }, { status: 200 });
    } catch (error) {
        console.error("Fetch Users Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);
        const roleError = requireRole(user, [ROLES.SUPER_ADMIN]);
        if (roleError) return roleError;

        const body = await req.json();
        const { name, email, role, departmentId, password } = body;

        if (!name || !email || !role || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const existingUser = db.prepare("SELECT id FROM User WHERE email = ?").get(email);
        if (existingUser) {
            return NextResponse.json({ error: "Email already exists" }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const id = crypto.randomUUID();

        db.prepare(`
            INSERT INTO User (id, email, passwordHash, name, role, departmentId)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(id, email, passwordHash, name, role, departmentId || null);

        return NextResponse.json({ message: "User created successfully", user: { id, name, email, role } }, { status: 201 });
    } catch (error) {
        console.error("Create User Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
