import express from "express";
import { sendMessage, getChatHistory } from "../controllers/messageController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.use(protect);

router.post("/", sendMessage);
router.get("/:postId", getChatHistory);

export default router;
