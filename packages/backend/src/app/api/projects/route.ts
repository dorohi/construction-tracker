import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";

const DEFAULT_MATERIAL_CATEGORIES = [
  "Фундамент", "Стены", "Кровля", "Сантехника", "Электрика", "Отделка",
];
const DEFAULT_LABOR_CATEGORIES = [
  "Каменные работы", "Сантехнические работы", "Электромонтажные работы", "Разнорабочие",
];

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const projects = await prisma.project.findMany({
    where: { userId: auth.userId },
    include: {
      expenses: { select: { amount: true, type: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const data = projects.map((p) => {
    const totalSpent = p.expenses.reduce((s, e) => s + e.amount, 0);
    const materialTotal = p.expenses
      .filter((e) => e.type === "MATERIAL")
      .reduce((s, e) => s + e.amount, 0);
    const laborTotal = p.expenses
      .filter((e) => e.type === "LABOR")
      .reduce((s, e) => s + e.amount, 0);

    const { expenses, ...project } = p;
    return {
      ...project,
      totalSpent,
      materialTotal,
      laborTotal,
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
        { error: "Project name is required" },
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
    ];
    await prisma.category.createMany({ data: categoryData });

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
