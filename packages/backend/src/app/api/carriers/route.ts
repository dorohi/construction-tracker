import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const carriers = await prisma.carrier.findMany({
    where: { userId: auth.userId },
    orderBy: [{ isFavorite: "desc" }, { name: "asc" }],
  });

  return NextResponse.json({ data: carriers });
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { name, phone, website, vehicle, licensePlate, notes } =
      await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Имя водителя обязательно" },
        { status: 400 }
      );
    }

    const carrier = await prisma.carrier.create({
      data: {
        name,
        phone: phone || null,
        website: website || null,
        vehicle: vehicle || null,
        licensePlate: licensePlate || null,
        notes: notes || null,
        userId: auth.userId,
      },
    });

    return NextResponse.json({ data: carrier }, { status: 201 });
  } catch (error) {
    console.error("Create carrier error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
