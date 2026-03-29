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

  const categories = await prisma.category.findMany({
    where: { projectId },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ data: categories });
}

export async function DELETE(request: NextRequest, { params }: Params) {
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
    const { categoryId } = await request.json();

    if (!categoryId) {
      return NextResponse.json(
        { error: "ID категории обязателен" },
        { status: 400 }
      );
    }

    const category = await prisma.category.findFirst({
      where: { id: categoryId, projectId },
    });
    if (!category) {
      return NextResponse.json(
        { error: "Категория не найдена" },
        { status: 404 }
      );
    }

    await prisma.$transaction([
      prisma.expense.updateMany({
        where: { categoryId },
        data: { categoryId: null },
      }),
      prisma.category.delete({
        where: { id: categoryId },
      }),
    ]);

    logAction({ userId: auth.userId, action: "DELETE", entity: "category", entityId: categoryId, details: category.name, ip: getClientIp(request) });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
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

    if (type !== "MATERIAL" && type !== "LABOR" && type !== "DELIVERY" && type !== "TOOL") {
      return NextResponse.json(
        { error: "Тип должен быть MATERIAL, LABOR, DELIVERY или TOOL" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: { name, type, projectId },
    });

    logAction({ userId: auth.userId, action: "CREATE", entity: "category", entityId: category.id, details: category.name, ip: getClientIp(request) });

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
