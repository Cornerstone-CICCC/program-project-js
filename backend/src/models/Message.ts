import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema(
  {
    shared_post_id: {
      type: Schema.Types.ObjectId,
      ref: "SharedPost",
      required: true,
    },
    sender_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
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

export const Message = mongoose.model("Message", MessageSchema);
