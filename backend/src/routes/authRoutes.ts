import express from "express";
import { signup, login, getMe } from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getMe); // 내 정보 조회는 로그인이 필요하므로 protect 추가

export default router;
