import db from "./db";
import { NextRequest } from "next/server";

export interface LogParams {
    action: string;
    entityType: string;
    entityId: string;
    userId?: string;
    details: any;
    req?: NextRequest;
}

/**
 * Helper to create an AuditLog record.
 */
export async function logActivity({ action, entityType, entityId, userId, details, req }: LogParams) {
    try {
        // Try to extract IP address if request is provided
        let ipAddress = null;
        if (req) {
            ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
        }

        db.prepare(`
          INSERT INTO AuditLog (id, action, entityType, entityId, userId, details, ipAddress, timestamp)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)),
            action,
            entityType,
            entityId,
            userId || null,
            JSON.stringify(details),
            ipAddress,
            new Date().toISOString()
        );
    } catch (error) {
        console.error("Failed to write audit log:", error);
        // Do not throw, as logging should not break the main operation
    }
}
