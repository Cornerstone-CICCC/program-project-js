import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "인증 실패" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const result = await prisma.ingredient.updateMany({
      where: {
        id: id,
        userId: session.user.id, // 이제 POST에서 id를 넣으므로 정상 작동합니다.
      },
      data: {
        name: body.name,
        quantity: body.quantity
          ? parseFloat(body.quantity.toString())
          : undefined,
        unit: body.unit,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
        memo: body.memo,
        category: body.category,
        location: body.location,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "아이템을 찾을 수 없거나 수정 권한이 없습니다." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "인증 실패" }, { status: 401 });

    const { id } = await params;

    const result = await prisma.ingredient.deleteMany({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "삭제할 아이템이 없거나 권한이 없습니다." },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "삭제 완료" });
  } catch (error) {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
