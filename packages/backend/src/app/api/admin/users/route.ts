import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  if (!auth.isAdmin) {
    return NextResponse.json(
      { error: "Доступ запрещён" },
      { status: 403 }
    );
  }

  const users = await prisma.user.findMany({
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
    orderBy: { createdAt: "desc" },
  });

  // Get expense totals grouped by project
  const expenseTotals = await prisma.expense.groupBy({
    by: ["projectId"],
    _sum: { amount: true },
  });

  // Map projectId -> total
  const projectExpenseMap = new Map<string, number>();
  for (const row of expenseTotals) {
    projectExpenseMap.set(row.projectId, row._sum.amount ?? 0);
  }

  const usersData = users.map((user) => {
    const userProjectIds = user.projects.map((p) => p.id);
    const totalExpenses = userProjectIds.reduce(
      (sum, pid) => sum + (projectExpenseMap.get(pid) ?? 0),
      0
    );

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt.toISOString(),
      projectsCount: user._count.projects,
      suppliersCount: user._count.suppliers,
      carriersCount: user._count.carriers,
      workersCount: user._count.workers,
      totalExpenses,
    };
  });

  const summary = {
    totalUsers: users.length,
    totalProjects: usersData.reduce((s, u) => s + u.projectsCount, 0),
    totalExpenses: usersData.reduce((s, u) => s + u.totalExpenses, 0),
    totalSuppliers: usersData.reduce((s, u) => s + u.suppliersCount, 0),
    totalCarriers: usersData.reduce((s, u) => s + u.carriersCount, 0),
    totalWorkers: usersData.reduce((s, u) => s + u.workersCount, 0),
  };

  return NextResponse.json({ data: { summary, users: usersData } });
}
