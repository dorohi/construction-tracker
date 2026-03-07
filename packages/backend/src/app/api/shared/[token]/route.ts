import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ token: string }> };

// Get shared project detail (no auth required)
export async function GET(_request: NextRequest, { params }: Params) {
  const { token } = await params;

  const project = await prisma.project.findFirst({
    where: { shareToken: token, isPublic: true },
    include: {
      user: { select: { name: true } },
      categories: true,
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Проект не найден или не является публичным" }, { status: 404 });
  }

  const expenses = await prisma.expense.findMany({
    where: { projectId: project.id },
    include: { category: true },
    orderBy: { date: "desc" },
  });

  const actual = expenses.filter((e) => !e.planned);
  const totalSpent = actual.reduce((s, e) => s + e.amount, 0);
  const plannedTotal = expenses.filter((e) => e.planned).reduce((s, e) => s + e.amount, 0);
  const materialTotal = actual.filter((e) => e.type === "MATERIAL").reduce((s, e) => s + e.amount, 0);
  const laborTotal = actual.filter((e) => e.type === "LABOR").reduce((s, e) => s + e.amount, 0);
  const deliveryTotal = actual.filter((e) => e.type === "DELIVERY").reduce((s, e) => s + e.amount, 0);

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
      project: {
        name: project.name,
        description: project.description,
        budget: project.budget,
        ownerName: project.user.name,
        createdAt: project.createdAt.toISOString(),
      },
      summary: {
        totalSpent,
        plannedTotal,
        materialTotal,
        laborTotal,
        deliveryTotal,
        budget: project.budget,
        remaining: project.budget ? project.budget - totalSpent : null,
        byCategory: Array.from(categoryMap.values()),
      },
      expenses: expenses.map((e) => ({
        id: e.id,
        type: e.type,
        title: e.title,
        description: e.description,
        amount: e.amount,
        quantity: e.quantity,
        unit: e.unit,
        unitPrice: e.unitPrice,
        supplier: e.supplier,
        carrier: e.carrier,
        worker: e.worker,
        hoursWorked: e.hoursWorked,
        hourlyRate: e.hourlyRate,
        planned: e.planned,
        date: e.date.toISOString(),
        categoryId: e.categoryId,
        category: e.category,
        projectId: e.projectId,
        createdAt: e.createdAt.toISOString(),
      })),
    },
  });
}
