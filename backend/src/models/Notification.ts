import mongoose, { Schema } from "mongoose";

const NotificationSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    is_read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: "created_at" } },
);

export const Notification = mongoose.model("Notification", NotificationSchema);
