import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";
import { logAction, getClientIp } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

// Toggle sharing on/off
export async function POST(request: NextRequest, { params }: Params) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: { id, userId: auth.userId },
  });
  if (!project) {
    return NextResponse.json({ error: "Проект не найден" }, { status: 404 });
  }

  const isPublic = !project.isPublic;
  const shareToken = isPublic
    ? project.shareToken || randomUUID().replace(/-/g, "").slice(0, 16)
    : project.shareToken;

  const updated = await prisma.project.update({
    where: { id },
    data: { isPublic, shareToken },
  });

  logAction({
    userId: auth.userId,
    action: isPublic ? "SHARE" : "UNSHARE",
    entity: "project",
    entityId: id,
    details: project.name,
    ip: getClientIp(request),
  });

  return NextResponse.json({
    data: {
      isPublic: updated.isPublic,
      shareToken: updated.shareToken,
    },
  });
}
