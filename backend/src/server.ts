import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";

import authRoutes from "./routes/authRoutes";
import ingredientRoutes from "./routes/ingredientRoutes";
import sharedPostRoutes from "./routes/sharedPostRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import recipeRoutes from "./routes/recipeRoutes";
import messageRoutes from "./routes/messageRoutes";

// 1. 환경 변수 설정
dotenv.config();

// 2. DB 연결
connectDB();

const app = express();

// 3. 미들웨어 설정
app.use(cors());
app.use(express.json());

// 4. API 라우터 연결
app.use("/api/auth", authRoutes);
app.use("/api/ingredients", ingredientRoutes);
app.use("/api/shared-posts", sharedPostRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/messages", messageRoutes);

// 5. 서버 시작
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
