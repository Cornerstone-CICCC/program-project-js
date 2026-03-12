import { Request, Response } from "express";
import { Message } from "../models/Message";
import { SharedPost } from "../models/SharedPost";
import { Notification } from "../models/Notification";

// @desc    Send a message
// @route   POST /api/messages
export const sendMessage = async (req: any, res: Response) => {
  try {
    const { shared_post_id, content } = req.body;

    // 1. 게시글 정보를 가져와서 작성자(receiver_id)가 누구인지 알아냅니다.
    const post = await SharedPost.findById(shared_post_id);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    // 2. 메시지 생성 (receiver_id를 자동으로 post.user_id로 지정)
    const newMessage = await Message.create({
      shared_post_id,
      sender_id: req.user.id,
      receiver_id: post.user_id, // 👈 프론트에서 receiver_id를 안 보내도 됨!
      content,
    });

    // 2. 게시글 주인에게 알림 생성 (추가된 로직! 🚀)
    await Notification.create({
      user_id: post.user_id,
      message: `새로운 나눔 메시지: "${content.substring(0, 10)}..."`,
    });

    res.status(201).json(newMessage);
  } catch (error: any) {
    res
      .status(400)
      .json({ message: "Failed to send message.", error: error.message });
  }
};

// @desc    Get chat history for a specific post
// @route   GET /api/messages/:postId
export const getChatHistory = async (req: any, res: Response) => {
  try {
    const { postId } = req.params;

    // 1. 대화 목록 불러오기
    const chatHistory = await Message.find({
      shared_post_id: postId,
      $or: [{ sender_id: req.user.id }, { receiver_id: req.user.id }],
    })
      .sort({ created_at: 1 })
      .populate("sender_id", "name")
      .populate("receiver_id", "name");

    // 2. 💡 읽음 처리 업데이트 (함수 내부 하단에 위치)
    // 내가 수신자인 메시지들만 '읽음'으로 바꿉니다.
    await Message.updateMany(
      {
        shared_post_id: postId,
        receiver_id: req.user.id,
        is_read: false,
      },
      { $set: { is_read: true } },
    );

    res.status(200).json(chatHistory);
  } catch (error) {
    res.status(400).json({ message: "Failed to fetch chat history." });
  }
};
