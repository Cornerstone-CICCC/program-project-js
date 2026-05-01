import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { firstName, lastName, currentPassword, nextPassword } = body;

    // 1. 유저 정보 업데이트 데이터 준비 (빈 객체로 시작)
    const updateData: any = {};

    // ✅ 이름과 성이 입력되었을 때만 (공백 제외) 데이터에 추가
    if (firstName && firstName.trim() !== "") updateData.firstName = firstName;
    if (lastName && lastName.trim() !== "") updateData.lastName = lastName;

    // 2. 비밀번호 변경 요청이 있는 경우
    if (currentPassword && nextPassword) {
      const user = await db.user.findUnique({ where: { id: session.user.id } });

      if (!user) return new NextResponse("User not found", { status: 404 });

      const isCorrect = await bcrypt.compare(currentPassword, user.password);

      if (!isCorrect)
        return new NextResponse("Current password incorrect", { status: 400 });

      updateData.password = await bcrypt.hash(nextPassword, 10);
    }

    // ✅ 만약 업데이트할 데이터가 아무것도 없다면 (이름도, 비번도 안 쳤다면)
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "No changes detected" });
    }

    // 3. DB 업데이트
    await db.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json({ message: "Success" });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
