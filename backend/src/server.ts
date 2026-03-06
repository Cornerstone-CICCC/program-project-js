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

// 1. Load environment variables
dotenv.config();

// 2. Connect to Database
connectDB();

const app = express();

// 3. Middlewares
app.use(cors());
app.use(express.json());

// 4. API Routes
app.use("/api/auth", authRoutes);
app.use("/api/ingredients", ingredientRoutes);
app.use("/api/shared-posts", sharedPostRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/messages", messageRoutes);

// 5. Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
