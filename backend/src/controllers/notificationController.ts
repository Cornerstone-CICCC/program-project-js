import { Request, Response } from "express";
import { Notification } from "../models/Notification";

export const getMyNotifications = async (req: any, res: Response) => {
  try {
    const notifications = await Notification.find({
      recipient_id: req.user.id,
    }).sort({ created_at: -1 }); // newest first

    res.status(200).json(notifications);
  } catch (error) {
    res.status(400).json({ message: "Failed to retrieve notifications." });
  }
};
