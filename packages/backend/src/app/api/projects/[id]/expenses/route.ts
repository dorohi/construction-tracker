import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id: projectId } = await params;

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: auth.userId },
  });
  if (!project) {
    return NextResponse.json({ error: "Проект не найден" }, { status: 404 });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const categoryId = url.searchParams.get("categoryId");

  const where: Record<string, unknown> = { projectId };
  if (type) where.type = type;
  if (categoryId) where.categoryId = categoryId;

  const expenses = await prisma.expense.findMany({
    where,
    include: { category: true },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ data: expenses });
}

export async function POST(request: NextRequest, { params }: Params) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id: projectId } = await params;

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: auth.userId },
  });
  if (!project) {
    return NextResponse.json({ error: "Проект не найден" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const {
      type, title, description, amount, quantity, unit, unitPrice,
      supplier, supplierId, carrier, carrierId, workerName, hoursWorked, hourlyRate, date, categoryId, planned,
    } = body;

    if (!type || !title || amount === undefined || !date) {
      return NextResponse.json(
        { error: "Тип, название, сумма и дата обязательны" },
        { status: 400 }
      );
    }

    if (type !== "MATERIAL" && type !== "LABOR" && type !== "DELIVERY") {
      return NextResponse.json(
        { error: "Тип должен быть MATERIAL, LABOR или DELIVERY" },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        type,
        title,
        description: description || null,
        amount,
        quantity: quantity ?? null,
        unit: unit || null,
        unitPrice: unitPrice ?? null,
        supplier: supplier || null,
        supplierId: supplierId || null,
        carrier: carrier || null,
        carrierId: carrierId || null,
        workerName: workerName || null,
        hoursWorked: hoursWorked ?? null,
        hourlyRate: hourlyRate ?? null,
        planned: planned ?? false,
        date: new Date(date),
        categoryId: categoryId || null,
        projectId,
      },
      include: { category: true },
    });

    return NextResponse.json({ data: expense }, { status: 201 });
  } catch (error) {
    console.error("Create expense error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
