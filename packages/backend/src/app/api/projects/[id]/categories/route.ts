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

  const categories = await prisma.category.findMany({
    where: { projectId },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ data: categories });
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
    const { name, type } = await request.json();

    if (!name || !type) {
      return NextResponse.json(
        { error: "Название и тип обязательны" },
        { status: 400 }
      );
    }

    if (type !== "MATERIAL" && type !== "LABOR" && type !== "DELIVERY") {
      return NextResponse.json(
        { error: "Тип должен быть MATERIAL, LABOR или DELIVERY" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: { name, type, projectId },
    });

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
