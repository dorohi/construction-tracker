import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";
import { logAction, getClientIp } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: { id, userId: auth.userId },
    include: { categories: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Проект не найден" }, { status: 404 });
  }

  return NextResponse.json({ data: project });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.project.findFirst({
    where: { id, userId: auth.userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Проект не найден" }, { status: 404 });
  }

  const { name, description, budget, order } = await request.json();

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(budget !== undefined && { budget }),
      ...(order !== undefined && { order }),
    },
  });

  logAction({ userId: auth.userId, action: "UPDATE", entity: "project", entityId: id, details: project.name, ip: getClientIp(request) });

  return NextResponse.json({ data: project });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.project.findFirst({
    where: { id, userId: auth.userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Проект не найден" }, { status: 404 });
  }

  await prisma.project.delete({ where: { id } });

  logAction({ userId: auth.userId, action: "DELETE", entity: "project", entityId: id, details: existing.name, ip: getClientIp(request) });

  return NextResponse.json({ data: { success: true } });
}
