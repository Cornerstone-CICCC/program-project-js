import mongoose, { Schema, Document } from "mongoose";

const CommentSchema = new Schema(
  {
    post_id: {
      type: Schema.Types.ObjectId,
      ref: "SharedPost", // 어떤 게시글에 달린 댓글인지
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User", // 누가 쓴 댓글인지
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

export const Comment = mongoose.model("Comment", CommentSchema);
