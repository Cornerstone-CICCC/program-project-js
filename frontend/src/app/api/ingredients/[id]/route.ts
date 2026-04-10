import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// PATCH: 재료 수정 (이름, 수량, 단위, 유통기한, 메모 등)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    // 1. 세션 확인 (로그인 여부)
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 },
      );
    }

    // 2. 비동기 params 처리 (Next.js 15 대응 필수)
    const { id } = await params;
    const body = await request.json();

    // 3. 데이터 추출
    const {
      name,
      quantity,
      unit,
      emoji,
      expiryDate,
      memo,
      category,
      purchaseLocation,
    } = body;

    // 4. Prisma 업데이트 수행
    const updatedItem = await prisma.ingredient.update({
      where: {
        id: id,
        userId: session.user.id, // 본인 아이템인지 이중 확인 (보안 강화)
      },
      data: {
        name,
        quantity:
          quantity !== undefined ? parseFloat(quantity.toString()) : undefined,
        unit,
        emoji,
        memo,
        category, // 스키마에 필수라고 되어 있으므로 함께 넘겨주는 것이 안전합니다.
        purchaseLocation,
        // 날짜 객체 변환
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error: any) {
    console.error("PATCH 에러 상세:", error);
    // Prisma 에러 코드 분기 처리 (아이템을 찾을 수 없는 경우 등)
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "수정할 재료를 찾을 수 없습니다." },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "재료 수정 중 오류가 발생했습니다.", details: error.message },
      { status: 500 },
    );
  }
}

// DELETE: 재료 삭제
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 },
      );
    }

    // 비동기 params 처리
    const { id } = await params;

    await prisma.ingredient.delete({
      where: {
        id: id,
        userId: session.user.id, // 본인 것만 삭제 가능하게 제한
      },
    });

    return NextResponse.json({ message: "성공적으로 삭제되었습니다." });
  } catch (error: any) {
    console.error("DELETE 에러 상세:", error);
    return NextResponse.json(
      { error: "삭제 중 오류가 발생했습니다.", details: error.message },
      { status: 500 },
    );
  }
}
