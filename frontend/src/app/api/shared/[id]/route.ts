import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 1. 상세 조회 (GET)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id || id.length !== 24) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const item = await prisma.sharedItem.findUnique({
      where: { id: id },
      include: {
        owner: {
          select: {
            firstName: true,
            lastName: true,
            location: true,
            avatar: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error: any) {
    console.error("❌ GET error:", error.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// 2. 데이터 수정 (PATCH) - 상세페이지의 '수정하기' 기능용
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Prisma를 사용하여 데이터 업데이트
    const updatedItem = await prisma.sharedItem.update({
      where: { id: id },
      data: {
        name: body.name,
        description: body.description,
        status: body.status,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,

        ...(body.availabilityStatus && {
          availabilityStatus: body.availabilityStatus,
        }),
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error: any) {
    console.error("❌ PATCH error:", error.message);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// 3. 데이터 삭제 (DELETE) - 상세페이지의 '삭제하기' 기능용
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Prisma를 사용하여 데이터 삭제
    await prisma.sharedItem.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Delete successful" });
  } catch (error: any) {
    console.error("❌ DELETE error:", error.message);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
