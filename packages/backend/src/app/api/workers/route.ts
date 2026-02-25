import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const workers = await prisma.worker.findMany({
    where: { userId: auth.userId },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ data: workers });
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { name, phone, website, notes } =
      await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Название поставщика обязательно" },
        { status: 400 }
      );
    }

    const worker = await prisma.worker.create({
      data: {
        name,
        phone: phone || null,
        website: website || null,
        notes: notes || null,
        userId: auth.userId,
      },
    });

    return NextResponse.json({ data: worker }, { status: 201 });
  } catch (error) {
    console.error("Create worker error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
