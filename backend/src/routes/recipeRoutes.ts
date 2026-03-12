import express from "express";
import {
  saveRecipeLog,
  getMyRecipeLogs,
  generateAiRecipe, // 추가
} from "../controllers/recipeController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.use(protect);

router.post("/log", saveRecipeLog);
router.get("/log", getMyRecipeLogs);
router.post("/generate", generateAiRecipe); // 추가

export default router;
