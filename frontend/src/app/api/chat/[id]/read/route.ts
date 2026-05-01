import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return new NextResponse("Unauthorized", { status: 401 });

    const chatId = params.id;

    // ✅ 내가 받은 모든 메시지를 '읽음' 처리
    await db.message.updateMany({
      where: {
        chatId: chatId,
        senderId: { not: session.user.id }, // 내가 보낸 게 아닌 것
        isRead: false,
      },
      data: { isRead: true },
    });

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    return new NextResponse("Error", { status: 500 });
  }
}
