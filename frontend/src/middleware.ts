import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  // 현재 세션 토큰을 가져옵니다.
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // 1. 로그인이 되어있는데 로그인/회원가입 페이지로 가려고 하면 메인("/")으로 보냄
  if (token && pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 2. 로그인이 안 되어있는데 보호된 페이지(메인 등)에 접근하면 로그인 페이지로 보냄
  if (!token && !pathname.startsWith("/auth") && pathname !== "/api/auth") {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

// 미들웨어가 작동할 경로 설정
export const config = {
  matcher: [
    /*
     * 아래 경로를 제외한 모든 경로에서 미들웨어 실행:
     * - api (인증 관련 API 제외)
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화 파일)
     * - favicon.ico (파비콘)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
