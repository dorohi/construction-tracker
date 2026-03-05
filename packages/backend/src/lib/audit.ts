import { prisma } from "./prisma";

export async function logAction(params: {
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ip?: string;
}) {
  try {
    await prisma.auditLog.create({ data: params });
  } catch (error) {
    console.error("Audit log error:", error);
  }
}

export function getClientIp(request: Request): string | undefined {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    undefined
  );
}
