import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, password } = await request.json();

    // 1. 데이터 누락 확인
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "모든 필드를 입력해주세요." },
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
            "비밀번호는 8자 이상이며 대문자, 소문자, 숫자, 특수문자를 모두 포함해야 합니다.",
        },
        { status: 400 },
      );
    }

    // 3. 중복 이메일 체크
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "이미 가입된 이메일입니다." },
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

    // 6. 로깅 (추후 Nodemailer 등 메일 발송 로직 추가 위치)
    console.log(`✅ 회원가입 성공: ${newUser.email}. 인증 메일을 보냅니다.`);

    return NextResponse.json(
      { message: "회원가입 성공! 이메일을 확인해주세요." },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json(
      { error: "회원가입 도중 서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
