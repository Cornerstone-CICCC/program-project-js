import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// 1. 상태 업데이트 (나눔 완료 처리)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  // 상태(availabilityStatus)뿐만 아니라 이름과 설명도 받을 수 있게 구조 분해 할당
  const { availabilityStatus, name, description } = body;

  const updatedItem = await prisma.sharedItem.update({
    where: { id: params.id },
    data: {
      // 데이터가 넘어온 경우에만 업데이트하도록 처리
      ...(availabilityStatus && { availabilityStatus }),
      ...(name && { name }),
      ...(description !== undefined && { description }),
    },
  });

  return NextResponse.json(updatedItem);
}

// 2. 삭제 기능
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.sharedItem.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ message: "Deleted successfully" });
}
