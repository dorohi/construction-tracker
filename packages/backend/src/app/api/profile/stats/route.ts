import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const userId = auth.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          projects: true,
          suppliers: true,
          carriers: true,
          workers: true,
        },
      },
      projects: {
        select: { id: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
  }

  const projectIds = user.projects.map((p) => p.id);

  let totalExpenses = 0;
  let expensesCount = 0;
  if (projectIds.length > 0) {
    const result = await prisma.expense.aggregate({
      where: { projectId: { in: projectIds } },
      _sum: { amount: true },
      _count: true,
    });
    totalExpenses = result._sum.amount ?? 0;
    expensesCount = result._count;
  }

  return NextResponse.json({
    data: {
      projectsCount: user._count.projects,
      totalExpenses,
      expensesCount,
      suppliersCount: user._count.suppliers,
      carriersCount: user._count.carriers,
      workersCount: user._count.workers,
    },
  });
}
