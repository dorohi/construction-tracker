import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";
import { logAction, getClientIp } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { items: { include: { category: true } }, project: true },
  });
  if (!invoice || invoice.project.userId !== auth.userId) {
    return NextResponse.json({ error: "Накладная не найдена" }, { status: 404 });
  }

  const total = invoice.items.reduce((s, it) => s + it.amount, 0);
  const { project: _project, ...rest } = invoice;
  return NextResponse.json({ data: { ...rest, total } });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { project: true, items: true },
  });
  if (!invoice || invoice.project.userId !== auth.userId) {
    return NextResponse.json({ error: "Накладная не найдена" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { title, description, date, supplier, supplierId, planned, items } = body;

    const invoiceDate = date !== undefined ? new Date(date) : invoice.date;
    const newSupplier = supplier !== undefined ? supplier || null : invoice.supplier;
    const newSupplierId = supplierId !== undefined ? supplierId || null : invoice.supplierId;
    const newPlanned = planned !== undefined ? planned : invoice.planned;

    const result = await prisma.$transaction(async (tx) => {
      await tx.invoice.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description: description || null }),
          ...(date !== undefined && { date: invoiceDate }),
          ...(supplier !== undefined && { supplier: newSupplier }),
          ...(supplierId !== undefined && { supplierId: newSupplierId }),
          ...(planned !== undefined && { planned: newPlanned }),
        },
      });

      if (Array.isArray(items)) {
        const existingIds = invoice.items.map((it) => it.id);
        const keepIds = items
          .filter((it: { id?: string }) => it.id)
          .map((it: { id?: string }) => it.id as string);
        const toDelete = existingIds.filter((eid) => !keepIds.includes(eid));
        if (toDelete.length) {
          await tx.expense.deleteMany({ where: { id: { in: toDelete }, invoiceId: id } });
        }

        for (const it of items as Array<{
          id?: string;
          title: string;
          categoryId?: string | null;
          quantity: number;
          unit?: string | null;
          unitPrice: number;
        }>) {
          const data = {
            type: "MATERIAL",
            title: it.title,
            amount: (it.quantity || 0) * (it.unitPrice || 0),
            quantity: it.quantity ?? null,
            unit: it.unit || null,
            unitPrice: it.unitPrice ?? null,
            supplier: newSupplier,
            supplierId: newSupplierId,
            planned: newPlanned,
            date: invoiceDate,
            categoryId: it.categoryId || null,
            projectId: invoice.projectId,
            invoiceId: id,
          };
          if (it.id && existingIds.includes(it.id)) {
            await tx.expense.update({ where: { id: it.id }, data });
          } else {
            await tx.expense.create({ data });
          }
        }
      } else {
        // позиции не переданы — обновили только шапку, распространяем общие поля на позиции
        await tx.expense.updateMany({
          where: { invoiceId: id },
          data: {
            supplier: newSupplier,
            supplierId: newSupplierId,
            planned: newPlanned,
            date: invoiceDate,
          },
        });
      }

      return tx.invoice.findUnique({
        where: { id },
        include: { items: { include: { category: true } } },
      });
    });

    logAction({
      userId: auth.userId,
      action: "UPDATE",
      entity: "invoice",
      entityId: id,
      details: result!.title,
      ip: getClientIp(request),
    });

    const total = result!.items.reduce((s, it) => s + it.amount, 0);
    return NextResponse.json({ data: { ...result, total } });
  } catch (error: unknown) {
    console.error("Update invoice error:", error);
    if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "P2003") {
      return NextResponse.json(
        { error: "Связанная запись (поставщик или категория) не найдена. Возможно, она была удалена." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { project: true },
  });
  if (!invoice || invoice.project.userId !== auth.userId) {
    return NextResponse.json({ error: "Накладная не найдена" }, { status: 404 });
  }

  await prisma.invoice.delete({ where: { id } }); // позиции удаляются каскадом

  logAction({
    userId: auth.userId,
    action: "DELETE",
    entity: "invoice",
    entityId: id,
    details: invoice.title,
    ip: getClientIp(request),
  });

  return NextResponse.json({ data: { success: true } });
}
