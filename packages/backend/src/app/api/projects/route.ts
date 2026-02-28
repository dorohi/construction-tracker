import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";

const DEFAULT_MATERIAL_CATEGORIES = [
  "Фундамент", "Стены", "Кровля", "Сантехника", "Электрика", "Отделка",
];
const DEFAULT_LABOR_CATEGORIES = [
  "Каменные работы", "Сантехнические работы", "Электромонтажные работы", "Разнорабочие",
];
const DEFAULT_DELIVERY_CATEGORIES = [
  "Доставка материалов", "Доставка оборудования",
];

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const projects = await prisma.project.findMany({
    where: { userId: auth.userId },
    include: {
      expenses: { select: { amount: true, type: true, planned: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Sort: pinned projects first (by order asc), then unpinned by createdAt desc
  projects.sort((a, b) => {
    if (a.order != null && b.order != null) return a.order - b.order;
    if (a.order != null) return -1;
    if (b.order != null) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const data = projects.map((p) => {
    const actual = p.expenses.filter((e) => !e.planned);
    const totalSpent = actual.reduce((s, e) => s + e.amount, 0);
    const plannedTotal = p.expenses
      .filter((e) => e.planned)
      .reduce((s, e) => s + e.amount, 0);
    const materialTotal = actual
      .filter((e) => e.type === "MATERIAL")
      .reduce((s, e) => s + e.amount, 0);
    const laborTotal = actual
      .filter((e) => e.type === "LABOR")
      .reduce((s, e) => s + e.amount, 0);
    const deliveryTotal = actual
      .filter((e) => e.type === "DELIVERY")
      .reduce((s, e) => s + e.amount, 0);

    const { expenses, ...project } = p;
    return {
      ...project,
      totalSpent,
      plannedTotal,
      materialTotal,
      laborTotal,
      deliveryTotal,
      expenseCount: expenses.length,
    };
  });

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { name, description, budget } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Название проекта обязательно" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        budget: budget ?? null,
        userId: auth.userId,
      },
    });

    // Seed default categories
    const categoryData = [
      ...DEFAULT_MATERIAL_CATEGORIES.map((n) => ({
        name: n,
        type: "MATERIAL" as const,
        projectId: project.id,
      })),
      ...DEFAULT_LABOR_CATEGORIES.map((n) => ({
        name: n,
        type: "LABOR" as const,
        projectId: project.id,
      })),
      ...DEFAULT_DELIVERY_CATEGORIES.map((n) => ({
        name: n,
        type: "DELIVERY" as const,
        projectId: project.id,
      })),
    ];
    await prisma.category.createMany({ data: categoryData });

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
