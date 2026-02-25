import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  const item = await prisma.news.findUnique({
    where: { id },
    include: {
      author: { select: { name: true } },
      reactions: true,
    },
  });

  if (!item) {
    return NextResponse.json({ error: "Новость не найдена" }, { status: 404 });
  }

  const likes = item.reactions.filter((r) => r.type === "like").length;
  const dislikes = item.reactions.filter((r) => r.type === "dislike").length;
  const userReaction =
    item.reactions.find((r) => r.userId === auth.userId)?.type ?? null;

  return NextResponse.json({
    data: {
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
    },
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  const existing = await prisma.news.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Новость не найдена" }, { status: 404 });
  }
  if (existing.authorId !== auth.userId && !auth.isAdmin) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  try {
    const { title, content } = await request.json();

    const updated = await prisma.news.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
      },
      include: {
        author: { select: { name: true } },
        reactions: true,
      },
    });

    const likes = updated.reactions.filter((r) => r.type === "like").length;
    const dislikes = updated.reactions.filter((r) => r.type === "dislike").length;
    const userReaction =
      updated.reactions.find((r) => r.userId === auth.userId)?.type ?? null;

    return NextResponse.json({
      data: {
        id: updated.id,
        title: updated.title,
        content: updated.content,
        authorId: updated.authorId,
        authorName: updated.author.name,
        likes,
        dislikes,
        userReaction,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Update news error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  const existing = await prisma.news.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Новость не найдена" }, { status: 404 });
  }
  if (existing.authorId !== auth.userId && !auth.isAdmin) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  await prisma.news.delete({ where: { id } });

  return NextResponse.json({ data: { success: true } });
}
