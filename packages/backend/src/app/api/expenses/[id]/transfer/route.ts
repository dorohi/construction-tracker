import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  const expense = await prisma.expense.findUnique({
    where: { id },
    include: { project: true, category: true },
  });
  if (!expense || expense.project.userId !== auth.userId) {
    return NextResponse.json({ error: "Расход не найден" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { targetProjectId, targetType, targetCategoryId, quantity, description } = body;

    if (!targetProjectId || !targetType || !quantity) {
      return NextResponse.json({ error: "Не указаны обязательные поля" }, { status: 400 });
    }

    if (quantity <= 0) {
      return NextResponse.json({ error: "Количество должно быть больше 0" }, { status: 400 });
    }

    if (expense.quantity == null || quantity > expense.quantity) {
      return NextResponse.json({ error: "Количество превышает доступное" }, { status: 400 });
    }

    // Verify target project belongs to user
    const targetProject = await prisma.project.findUnique({
      where: { id: targetProjectId },
    });
    if (!targetProject || targetProject.userId !== auth.userId) {
      return NextResponse.json({ error: "Целевой проект не найден" }, { status: 404 });
    }

    // Verify target category if provided
    if (targetCategoryId) {
      const targetCategory = await prisma.category.findUnique({
        where: { id: targetCategoryId },
      });
      if (!targetCategory || targetCategory.projectId !== targetProjectId) {
        return NextResponse.json({ error: "Целевая категория не найдена" }, { status: 404 });
      }
    }

    const isFullTransfer = quantity === expense.quantity;
    const targetAmount = quantity * (expense.unitPrice || 0);

    const result = await prisma.$transaction(async (tx) => {
      let source = null;

      if (isFullTransfer) {
        await tx.expense.delete({ where: { id } });
      } else {
        const newQuantity = expense.quantity! - quantity;
        const newAmount = newQuantity * (expense.unitPrice || 0);
        source = await tx.expense.update({
          where: { id },
          data: { quantity: newQuantity, amount: newAmount },
          include: { category: true },
        });
      }

      const target = await tx.expense.create({
        data: {
          type: targetType,
          title: expense.title,
          description: description || expense.description,
          amount: targetAmount,
          quantity,
          unit: expense.unit,
          unitPrice: expense.unitPrice,
          supplier: expense.supplier,
          supplierId: expense.supplierId,
          carrier: expense.carrier,
          carrierId: expense.carrierId,
          worker: expense.worker,
          workerId: expense.workerId,
          hoursWorked: expense.hoursWorked,
          hourlyRate: expense.hourlyRate,
          planned: expense.planned,
          date: expense.date,
          categoryId: targetCategoryId || null,
          projectId: targetProjectId,
        },
        include: { category: true },
      });

      return { source, target };
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Transfer expense error:", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
