import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  const carrier = await prisma.carrier.findFirst({
    where: { id, userId: auth.userId },
  });
  if (!carrier) {
    return NextResponse.json(
      { error: "Доставщик не найден" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: carrier });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  const carrier = await prisma.carrier.findFirst({
    where: { id, userId: auth.userId },
  });
  if (!carrier) {
    return NextResponse.json(
      { error: "Доставщик не найден" },
      { status: 404 }
    );
  }

  try {
    const { name, phone, website, vehicle, licensePlate, isFavorite, notes } =
      await request.json();

    const updated = await prisma.carrier.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(website !== undefined && { website: website || null }),
        ...(vehicle !== undefined && { vehicle: vehicle || null }),
        ...(licensePlate !== undefined && { licensePlate: licensePlate || null }),
        ...(isFavorite !== undefined && { isFavorite }),
        ...(notes !== undefined && { notes: notes || null }),
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Update carrier error:", error);
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

  const carrier = await prisma.carrier.findFirst({
    where: { id, userId: auth.userId },
  });
  if (!carrier) {
    return NextResponse.json(
      { error: "Доставщик не найден" },
      { status: 404 }
    );
  }

  await prisma.expense.updateMany({
    where: { carrierId: id },
    data: { carrierId: null },
  });

  await prisma.carrier.delete({ where: { id } });
  return NextResponse.json({ data: { success: true } });
}
