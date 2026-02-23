import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  const expense = await prisma.expense.findUnique({
    where: { id },
    include: { project: true },
  });
  if (!expense || expense.project.userId !== auth.userId) {
    return NextResponse.json({ error: "Расход не найден" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const {
      type, title, description, amount, quantity, unit, unitPrice,
      supplier, supplierId, carrier, carrierId, worker, workerId, hoursWorked, hourlyRate,
      date, categoryId, planned,
    } = body;

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        ...(type !== undefined && { type }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description: description || null }),
        ...(amount !== undefined && { amount }),
        ...(quantity !== undefined && { quantity: quantity ?? null }),
        ...(unit !== undefined && { unit: unit || null }),
        ...(unitPrice !== undefined && { unitPrice: unitPrice ?? null }),
        ...(supplier !== undefined && { supplier: supplier || null }),
        ...(supplierId !== undefined && { supplierId: supplierId || null }),
        ...(carrier !== undefined && { carrier: carrier || null }),
        ...(carrierId !== undefined && { carrierId: carrierId || null }),
        ...(worker !== undefined && { worker: worker || null }),
        ...(workerId !== undefined && { workerId: workerId || null }),
        ...(hoursWorked !== undefined && { hoursWorked: hoursWorked ?? null }),
        ...(hourlyRate !== undefined && { hourlyRate: hourlyRate ?? null }),
        ...(planned !== undefined && { planned }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
      },
      include: { category: true },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Update expense error:", error);
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

  const expense = await prisma.expense.findUnique({
    where: { id },
    include: { project: true },
  });
  if (!expense || expense.project.userId !== auth.userId) {
    return NextResponse.json({ error: "Расход не найден" }, { status: 404 });
  }

  await prisma.expense.delete({ where: { id } });
  return NextResponse.json({ data: { success: true } });
}
