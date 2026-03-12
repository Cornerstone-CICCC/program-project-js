import express from "express";
import {
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from "../controllers/ingredientController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.route("/").get(protect, getIngredients).post(protect, createIngredient);

router
  .route("/:id")
  .get(protect, getIngredients)
  .patch(protect, updateIngredient)
  .delete(protect, deleteIngredient);

export default router;
