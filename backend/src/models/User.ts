import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // 기존 name을 삭제하고 두 필드로 분할
    firstName: {
      type: String,
      required: true,
      trim: true, // 앞뒤 공백 제거
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // 이메일은 항상 소문자로 저장
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: "created_at" },
    // virtual 필드를 JSON이나 Object로 변환했을 때도 보이게 설정
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// DB에 저장되지는 않지만, 코드 상에서 유저의 전체 이름을 편하게 부르기 위한 설정
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

export const User = mongoose.model("User", userSchema);
