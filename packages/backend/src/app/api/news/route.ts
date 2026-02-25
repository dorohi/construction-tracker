import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const newsList = await prisma.news.findMany({
    include: {
      author: { select: { name: true } },
      reactions: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const data = newsList.map((item) => {
    const likes = item.reactions.filter((r) => r.type === "like").length;
    const dislikes = item.reactions.filter((r) => r.type === "dislike").length;
    const userReaction =
      item.reactions.find((r) => r.userId === auth.userId)?.type ?? null;

    return {
      id: item.id,
      title: item.title,
      content: item.content,
      authorId: item.authorId,
      authorName: item.author.name,
      likes,
      dislikes,
      userReaction,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  });

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    if (!auth.isAdmin) {
      return NextResponse.json(
        { error: "Только администраторы могут создавать новости" },
        { status: 403 }
      );
    }

    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Заголовок и содержание обязательны" },
        { status: 400 }
      );
    }

    const news = await prisma.news.create({
      data: {
        title,
        content,
        authorId: auth.userId,
      },
      include: {
        author: { select: { name: true } },
      },
    });

    return NextResponse.json(
      {
        data: {
          id: news.id,
          title: news.title,
          content: news.content,
          authorId: news.authorId,
          authorName: news.author.name,
          likes: 0,
          dislikes: 0,
          userReaction: null,
          createdAt: news.createdAt.toISOString(),
          updatedAt: news.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create news error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
