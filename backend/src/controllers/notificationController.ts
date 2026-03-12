import { Response } from "express";
import { Notification } from "../models/Notification";

// @desc    Get my notifications
// @route   GET /api/notifications
export const getMyNotifications = async (req: any, res: Response) => {
  try {
    const notifications = await Notification.find({
      user_id: req.user.id,
    }).sort({ created_at: -1 }); // 최신 알림이 위로 오도록
    res.status(200).json(notifications);
  } catch (error) {
    res.status(400).json({ message: "Failed to fetch notifications." });
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id
export const markAsRead = async (req: any, res: Response) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { is_read: true },
      { new: true },
    );
    res.status(200).json(notification);
  } catch (error) {
    res.status(400).json({ message: "Failed to update notification." });
  }
};
