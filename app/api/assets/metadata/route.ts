import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
    try {
        const departments = db.prepare("SELECT id, name FROM Department ORDER BY name ASC").all();
        const categories = db.prepare("SELECT DISTINCT category FROM Asset").all();
        const users = db.prepare("SELECT id, name, role, departmentId FROM User ORDER BY name ASC").all();

        return NextResponse.json({ departments, categories, users });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 });
    }
}
