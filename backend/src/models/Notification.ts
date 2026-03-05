import mongoose, { Schema } from "mongoose";

const NotificationSchema = new Schema(
  {
    recipient_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["MESSAGE", "EXPIRATION"], required: true },
    content: { type: String, required: true },
    related_id: { type: Schema.Types.ObjectId },
    is_read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "created_at" } },
);

export const Notification = mongoose.model("Notification", NotificationSchema);
