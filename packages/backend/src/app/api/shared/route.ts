import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// List all public projects (no auth required)
export async function GET() {
  const projects = await prisma.project.findMany({
    where: { isPublic: true },
    include: {
      user: { select: { name: true } },
      expenses: { select: { amount: true, type: true, planned: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const data = projects.map((p) => {
    const actual = p.expenses.filter((e) => !e.planned);
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      budget: p.budget,
      ownerName: p.user.name,
      totalSpent: actual.reduce((s, e) => s + e.amount, 0),
      plannedTotal: p.expenses.filter((e) => e.planned).reduce((s, e) => s + e.amount, 0),
      materialTotal: actual.filter((e) => e.type === "MATERIAL").reduce((s, e) => s + e.amount, 0),
      laborTotal: actual.filter((e) => e.type === "LABOR").reduce((s, e) => s + e.amount, 0),
      deliveryTotal: actual.filter((e) => e.type === "DELIVERY").reduce((s, e) => s + e.amount, 0),
      expenseCount: actual.length,
      shareToken: p.shareToken,
      createdAt: p.createdAt.toISOString(),
    };
  });

  return NextResponse.json({ data });
}
