// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // 우리가 아까 만든 authOptions

const handler = NextAuth(authOptions);

// GET 요청(세션 확인)과 POST 요청(로그인/로그아웃) 모두 이 핸들러가 처리합니다.
export { handler as GET, handler as POST };
