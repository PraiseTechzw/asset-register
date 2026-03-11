import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const departmentsRes = await db.execute("SELECT id, name FROM Department ORDER BY name ASC");
        const departments = departmentsRes.rows;

        const categoriesRes = await db.execute("SELECT DISTINCT category FROM Asset");
        const categories = categoriesRes.rows;

        const usersRes = await db.execute("SELECT id, name, role, departmentId FROM User ORDER BY name ASC");
        const users = usersRes.rows;

        return NextResponse.json({ departments, categories, users });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 });
    }
}
