import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config(); // .env 파일 로드

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.DATABASE_URL;

// Middleware
app.use(cors()); // 프론트엔드에서의 접근 허용
app.use(express.json());

// MongoDB 연결
if (!MONGO_URI) {
  console.error("DATABASE_URL이 .env 파일에 정의되지 않았습니다.");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB 연결 성공!"))
  .catch((err) => console.error("❌ MongoDB 연결 실패:", err));

app.listen(PORT, () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
