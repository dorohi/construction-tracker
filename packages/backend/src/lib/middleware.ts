import { NextRequest, NextResponse } from "next/server";
import { verifyToken, type JwtPayload } from "./auth";

export function getAuthUser(request: NextRequest): JwtPayload | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function requireAuth(
  request: NextRequest
): JwtPayload | NextResponse {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
  return user;
}
