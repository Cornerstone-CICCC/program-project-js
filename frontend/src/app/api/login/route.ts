import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. 데이터 입력 확인
    if (!email || !password) {
      return NextResponse.json(
        { error: "Please enter both email and password." },
        { status: 400 },
      );
    }

    // 2. 이메일로 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 3. 사용자가 존재하지 않는 경우
    if (!user) {
      return NextResponse.json(
        { error: "Account does not exist." },
        { status: 401 },
      );
    }

    // 4. 비밀번호 일치 여부 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Password does not match." },
        { status: 401 },
      );
    }

    // 5. 로그인 성공 및 쿠키 생성 (핵심 수정 부분)
    console.log(`✅ Success Login: ${user.email}`);

    // 응답 객체를 먼저 생성합니다.
    const response = NextResponse.json(
      {
        message: "Success Login!",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
      { status: 200 },
    );

    // 🍪 브라우저에 세션 쿠키를 심어줍니다.
    // 이 쿠키가 있어야 api/ingredients에서 401을 뱉지 않습니다.
    response.cookies.set("session", "true", {
      httpOnly: true, // 자바스크립트로 접근 불가 (보안)
      secure: process.env.NODE_ENV === "production", // HTTPS에서만 전송
      sameSite: "lax",
      path: "/", // 모든 경로에서 쿠키 유효
      maxAge: 60 * 60 * 24, // 1일 동안 유지
    });

    return response;
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { error: "A server error occurred during login." },
      { status: 500 },
    );
  }
}
