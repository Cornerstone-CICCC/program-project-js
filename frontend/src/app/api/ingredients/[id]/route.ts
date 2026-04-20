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
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 },
      );

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
        { error: "Item not found or you do not have permission to edit it." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 },
      );

    const { id } = await params;

    const result = await prisma.ingredient.deleteMany({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "No item found to delete or you don't have permission." },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Delete completed" });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
