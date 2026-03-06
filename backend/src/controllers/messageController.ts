import { Request, Response } from "express";
import { Message } from "../models/Message";

// @desc    Send a message
// @route   POST /api/messages
export const sendMessage = async (req: any, res: Response) => {
  try {
    const { shared_post_id, receiver_id, content } = req.body;

    const newMessage = await Message.create({
      shared_post_id,
      sender_id: req.user.id,
      receiver_id,
      content,
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(400).json({ message: "Failed to send message." });
  }
};

// @desc    Get chat history for a specific post
// @route   GET /api/messages/:postId
export const getChatHistory = async (req: any, res: Response) => {
  try {
    const { postId } = req.params;

    // Retrieve messages related to the post where the user is either the sender or the receiver
    const chatHistory = await Message.find({
      shared_post_id: postId,
      $or: [{ sender_id: req.user.id }, { receiver_id: req.user.id }],
    })
      .sort({ created_at: 1 }) // sort by time (oldest first)
      .populate("sender_id", "name")
      .populate("receiver_id", "name");

    res.status(200).json(chatHistory);
  } catch (error) {
    res.status(400).json({ message: "Failed to fetch chat history." });
  }
};
