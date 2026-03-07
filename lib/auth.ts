import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-in-production";

export interface JwtPayload {
    userId: string;
    role: string;
    departmentId: string | null;
}

/**
 * Sign a new JWT token for a user.
 */
export function signToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

/**
 * Verify a JWT token.
 */
export function verifyToken(token: string): JwtPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        return decoded;
    } catch (error) {
        console.error("JWT Verification Failed:", error);
        return null;
    }
}

/**
 * Extract the user from the incoming request using the Authorization header.
 * Returns the user details or null if unauthorized.
 */
export async function getUserFromRequest(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.warn("Missing or invalid Authorization header");
        return null;
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);

    if (!payload) {
        console.error("No valid payload found for token");
        return null;
    }

    // Optionally fetch the full user from DB if needed, or just return payload
    // For performance, we initially return just the payload
    return payload;
}

/**
 * Require a specific role or higher for an endpoint.
 * Returns an error response if not authorized, or null if authorized.
 */
export function requireRole(payload: JwtPayload | null, allowedRoles: string[]) {
    if (!payload) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    if (!allowedRoles.includes(payload.role)) {
        return new Response(JSON.stringify({ error: "Forbidden: Insufficient permissions" }), { status: 403 });
    }

    return null;
}

// Role Constants
export const ROLES = {
    SUPER_ADMIN: "SUPER_ADMIN",
    ASSET_CONTROLLER: "ASSET_CONTROLLER",
    DEPT_OFFICER: "DEPT_OFFICER",
    AUDITOR: "AUDITOR",
};
