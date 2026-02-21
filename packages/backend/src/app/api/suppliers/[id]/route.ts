import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  const supplier = await prisma.supplier.findFirst({
    where: { id, userId: auth.userId },
  });
  if (!supplier) {
    return NextResponse.json(
      { error: "Поставщик не найден" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: supplier });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  const supplier = await prisma.supplier.findFirst({
    where: { id, userId: auth.userId },
  });
  if (!supplier) {
    return NextResponse.json(
      { error: "Поставщик не найден" },
      { status: 404 }
    );
  }

  try {
    const { name, contactName, phone, website, address, latitude, longitude, notes } =
      await request.json();

    const updated = await prisma.supplier.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(contactName !== undefined && { contactName: contactName || null }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(website !== undefined && { website: website || null }),
        ...(address !== undefined && { address: address || null }),
        ...(latitude !== undefined && { latitude: latitude ?? null }),
        ...(longitude !== undefined && { longitude: longitude ?? null }),
        ...(notes !== undefined && { notes: notes || null }),
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Update supplier error:", error);
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

  const supplier = await prisma.supplier.findFirst({
    where: { id, userId: auth.userId },
  });
  if (!supplier) {
    return NextResponse.json(
      { error: "Поставщик не найден" },
      { status: 404 }
    );
  }

  // Nullify supplierId in related expenses before deleting
  await prisma.expense.updateMany({
    where: { supplierId: id },
    data: { supplierId: null },
  });

  await prisma.supplier.delete({ where: { id } });
  return NextResponse.json({ data: { success: true } });
}
