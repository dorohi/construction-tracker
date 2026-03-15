import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";
import { logAction, getClientIp } from "@/lib/audit";

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

  const sp = new URL(request.url).searchParams;

  const all = sp.get("all") === "true";
  const page = all ? 1 : Math.max(1, parseInt(sp.get("page") || "1"));
  const limit = all ? 0 : Math.min(100, Math.max(1, parseInt(sp.get("limit") || "25")));

  const where: Record<string, unknown> = { projectId };

  // type filter (comma-separated: MATERIAL,LABOR)
  const types = sp.get("types");
  if (types) where.type = { in: types.split(",") };

  // category filter (comma-separated ids)
  const categoryIds = sp.get("categoryIds");
  if (categoryIds) where.categoryId = { in: categoryIds.split(",") };

  // title search (contains, case-insensitive)
  const title = sp.get("title");
  if (title) where.title = { contains: title };

  // date range
  const dateFrom = sp.get("dateFrom");
  const dateTo = sp.get("dateTo");
  if (dateFrom || dateTo) {
    const dateFilter: Record<string, Date> = {};
    if (dateFrom) dateFilter.gte = new Date(dateFrom);
    if (dateTo) dateFilter.lte = new Date(dateTo + "T23:59:59.999Z");
    where.date = dateFilter;
  }

  // amount range
  const amountFrom = sp.get("amountFrom");
  const amountTo = sp.get("amountTo");
  if (amountFrom || amountTo) {
    const amountFilter: Record<string, number> = {};
    if (amountFrom) amountFilter.gte = parseFloat(amountFrom);
    if (amountTo) amountFilter.lte = parseFloat(amountTo);
    where.amount = amountFilter;
  }

  // text search fields
  const supplier = sp.get("supplier");
  if (supplier) where.supplier = { contains: supplier };

  const carrier = sp.get("carrier");
  if (carrier) where.carrier = { contains: carrier };

  const worker = sp.get("worker");
  if (worker) where.worker = { contains: worker };

  // planned status
  const plannedStatus = sp.get("plannedStatus");
  if (plannedStatus === "planned") where.planned = true;
  else if (plannedStatus === "actual") where.planned = false;

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: { category: true },
      orderBy: { date: "desc" },
      ...(all ? {} : { skip: (page - 1) * limit, take: limit }),
    }),
    prisma.expense.count({ where }),
  ]);

  return NextResponse.json({ data: { expenses, total, page, limit } });
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
      supplier, supplierId, carrier, carrierId, worker,  workerId, hoursWorked, hourlyRate, calloutFee, date, categoryId, planned,
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
        worker: worker || null,
        workerId: workerId || null,
        hoursWorked: hoursWorked ?? null,
        hourlyRate: hourlyRate ?? null,
        calloutFee: calloutFee ?? null,
        planned: planned ?? false,
        date: new Date(date),
        categoryId: categoryId || null,
        projectId,
      },
      include: { category: true },
    });

    logAction({ userId: auth.userId, action: "CREATE", entity: "expense", entityId: expense.id, details: expense.title, ip: getClientIp(request) });

    return NextResponse.json({ data: expense }, { status: 201 });
  } catch (error: unknown) {
    console.error("Create expense error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2003"
    ) {
      return NextResponse.json(
        { error: "Связанная запись (поставщик, перевозчик или работник) не найдена. Возможно, она была удалена." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
