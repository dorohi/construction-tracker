import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id: newsId } = await params;

  const news = await prisma.news.findUnique({ where: { id: newsId } });
  if (!news) {
    return NextResponse.json({ error: "Новость не найдена" }, { status: 404 });
  }

  try {
    const { type } = await request.json();

    if (type !== "like" && type !== "dislike") {
      return NextResponse.json(
        { error: "Тип реакции должен быть like или dislike" },
        { status: 400 }
      );
    }

    const existing = await prisma.newsReaction.findUnique({
      where: { newsId_userId: { newsId, userId: auth.userId } },
    });

    if (existing) {
      if (existing.type === type) {
        // Same reaction — remove (toggle off)
        await prisma.newsReaction.delete({ where: { id: existing.id } });
      } else {
        // Different reaction — update
        await prisma.newsReaction.update({
          where: { id: existing.id },
          data: { type },
        });
      }
    } else {
      // No existing reaction — create
      await prisma.newsReaction.create({
        data: { type, newsId, userId: auth.userId },
      });
    }

    // Return updated counts
    const reactions = await prisma.newsReaction.findMany({ where: { newsId } });
    const likes = reactions.filter((r) => r.type === "like").length;
    const dislikes = reactions.filter((r) => r.type === "dislike").length;
    const userReaction =
      reactions.find((r) => r.userId === auth.userId)?.type ?? null;

    return NextResponse.json({ data: { likes, dislikes, userReaction } });
  } catch (error) {
    console.error("News reaction error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
