import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  console.log("🚀 회원가입 요청 서버 도착!");
  try {
    const { firstName, lastName, email, password } = await request.json();

    // 1. 데이터 누락 확인
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "Please fill in all fields." },
        { status: 400 },
      );
    }

    // 2. 비밀번호 복잡성 검사 (Regex)
    // 규칙: 8자 이상, 대문자 포함, 소문자 포함, 숫자 포함, 특수문자 포함
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters and include uppercase letters, lowercase letters, numbers, and special characters.",
        },
        { status: 400 },
      );
    }

    // 3. 중복 이메일 체크
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered." },
        { status: 400 },
      );
    }

    // 4. 비밀번호 암호화 (Salt Round: 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. 유저 생성
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        level: 1,
        rating: 0.0,
      },
    });

    // 6. Logging (future place to add email sending logic like Nodemailer)
    console.log(
      `✅ Signup successful: ${newUser.email}. Sending verification email.`,
    );

    return NextResponse.json(
      { message: "Signup successful! Please check your email." },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json(
      { error: "A server error occurred during signup." },
      { status: 500 },
    );
  }
}
