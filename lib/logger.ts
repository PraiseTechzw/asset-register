import { prisma } from "./prisma";
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

        await prisma.auditLog.create({
            data: {
                action,
                entityType,
                entityId,
                userId: userId || null,
                details: JSON.stringify(details),
                ipAddress,
            },
        });
    } catch (error) {
        console.error("Failed to write audit log:", error);
        // Do not throw, as logging should not break the main operation
    }
}
