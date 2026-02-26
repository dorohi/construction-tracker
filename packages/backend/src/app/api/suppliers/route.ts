import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const suppliers = await prisma.supplier.findMany({
    where: { userId: auth.userId },
    orderBy: [{ isFavorite: "desc" }, { name: "asc" }],
  });

  return NextResponse.json({ data: suppliers });
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { name, contactName, phone, website, address, latitude, longitude, hasDelivery, notes } =
      await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Название поставщика обязательно" },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        contactName: contactName || null,
        phone: phone || null,
        website: website || null,
        address: address || null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        hasDelivery: hasDelivery ?? false,
        notes: notes || null,
        userId: auth.userId,
      },
    });

    return NextResponse.json({ data: supplier }, { status: 201 });
  } catch (error) {
    console.error("Create supplier error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
