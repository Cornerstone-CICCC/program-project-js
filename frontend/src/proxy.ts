// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. 토큰 가져오기
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // 2. 무조건 통과시켜야 하는 경로 (정적 파일 및 로그인 처리 API)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes("favicon.ico") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  // 3. 로그인이 안 된 상태에서 /auth로 시작하지 않는 모든 경로 접근 시 -> /auth/login으로
  if (!token && !pathname.startsWith("/auth")) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // 4. 로그인 된 상태에서 /auth 페이지 접근 시 -> 메인으로
  if (token && pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
