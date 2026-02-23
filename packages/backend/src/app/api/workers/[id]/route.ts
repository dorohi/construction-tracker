import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  const worker = await prisma.worker.findFirst({
    where: { id, userId: auth.userId },
  });
  if (!worker) {
    return NextResponse.json(
      { error: "Работник не найден" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: worker });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  const worker = await prisma.worker.findFirst({
    where: { id, userId: auth.userId },
  });
  if (!worker) {
    return NextResponse.json(
      { error: "Работник не найден" },
      { status: 404 }
    );
  }

  try {
    const { name, phone, notes } =
      await request.json();

    const updated = await prisma.worker.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(notes !== undefined && { notes: notes || null }),
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Update worker error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  const worker = await prisma.worker.findFirst({
    where: { id, userId: auth.userId },
  });
  if (!worker) {
    return NextResponse.json(
      { error: "Работник не найден" },
      { status: 404 }
    );
  }

  // Nullify workerId in related expenses before deleting
  await prisma.expense.updateMany({
    where: { workerId: id },
    data: { workerId: null },
  });

  await prisma.worker.delete({ where: { id } });
  return NextResponse.json({ data: { success: true } });
}
