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

  const expenses = await prisma.expense.findMany({
    where: { projectId },
    include: { category: true },
  });

  const actual = expenses.filter((e) => !e.planned);
  const totalSpent = actual.reduce((s, e) => s + e.amount, 0);
  const plannedTotal = expenses
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

  // Group by category
  const categoryMap = new Map<
    string,
    { categoryId: string | null; categoryName: string; type: string; total: number; count: number }
  >();

  for (const expense of expenses) {
    const key = expense.categoryId || "uncategorized";
    const existing = categoryMap.get(key);
    if (existing) {
      existing.total += expense.amount;
      existing.count += 1;
    } else {
      categoryMap.set(key, {
        categoryId: expense.categoryId,
        categoryName: expense.category?.name || "Без категории",
        type: expense.type,
        total: expense.amount,
        count: 1,
      });
    }
  }

  return NextResponse.json({
    data: {
      totalSpent,
      plannedTotal,
      materialTotal,
      laborTotal,
      deliveryTotal,
      budget: project.budget,
      remaining: project.budget ? project.budget - totalSpent : null,
      byCategory: Array.from(categoryMap.values()),
    },
  });
}
