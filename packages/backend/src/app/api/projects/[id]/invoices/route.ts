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

  const [rows, total] = await Promise.all([
    prisma.invoice.findMany({
      where: { projectId },
      include: { items: { select: { amount: true } } },
      orderBy: { date: "desc" },
      ...(all ? {} : { skip: (page - 1) * limit, take: limit }),
    }),
    prisma.invoice.count({ where: { projectId } }),
  ]);

  const invoices = rows.map((inv) => ({
    id: inv.id,
    title: inv.title,
    supplier: inv.supplier,
    date: inv.date,
    planned: inv.planned,
    itemCount: inv.items.length,
    total: inv.items.reduce((s, it) => s + it.amount, 0),
    createdAt: inv.createdAt,
  }));

  return NextResponse.json({ data: { invoices, total, page, limit } });
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
    const { title, description, date, supplier, supplierId, planned, items } = body;

    if (!title || !date || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Название, дата и хотя бы одна позиция обязательны" },
        { status: 400 }
      );
    }

    for (const it of items) {
      if (!it.title || it.quantity === undefined || it.unitPrice === undefined) {
        return NextResponse.json(
          { error: "У каждой позиции должны быть название, количество и цена" },
          { status: 400 }
        );
      }
    }

    const invoiceDate = new Date(date);

    const invoice = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.create({
        data: {
          title,
          description: description || null,
          date: invoiceDate,
          supplier: supplier || null,
          supplierId: supplierId || null,
          planned: planned ?? false,
          projectId,
        },
      });

      await tx.expense.createMany({
        data: items.map(
          (it: {
            title: string;
            categoryId?: string | null;
            quantity: number;
            unit?: string | null;
            unitPrice: number;
          }) => ({
            type: "MATERIAL",
            title: it.title,
            amount: (it.quantity || 0) * (it.unitPrice || 0),
            quantity: it.quantity ?? null,
            unit: it.unit || null,
            unitPrice: it.unitPrice ?? null,
            supplier: supplier || null,
            supplierId: supplierId || null,
            planned: planned ?? false,
            date: invoiceDate,
            categoryId: it.categoryId || null,
            projectId,
            invoiceId: inv.id,
          })
        ),
      });

      return tx.invoice.findUnique({
        where: { id: inv.id },
        include: { items: { include: { category: true } } },
      });
    });

    logAction({
      userId: auth.userId,
      action: "CREATE",
      entity: "invoice",
      entityId: invoice!.id,
      details: invoice!.title,
      ip: getClientIp(request),
    });

    const total = invoice!.items.reduce((s, it) => s + it.amount, 0);
    return NextResponse.json({ data: { ...invoice, total } }, { status: 201 });
  } catch (error: unknown) {
    console.error("Create invoice error:", error);
    if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "P2003") {
      return NextResponse.json(
        { error: "Связанная запись (поставщик или категория) не найдена. Возможно, она была удалена." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
