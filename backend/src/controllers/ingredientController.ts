import { Request, Response } from "express";
import { Ingredient } from "../models/Ingredient";

// @desc    Get my ingredient list
// @route   GET /api/ingredients
export const getIngredients = async (req: any, res: Response) => {
  try {
    const ingredients = await Ingredient.find({ user_id: req.user.id });
    res.status(200).json(ingredients);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve ingredients." });
  }
};

// @desc    Add a new ingredient
// @route   POST /api/ingredients
export const createIngredient = async (req: any, res: Response) => {
  try {
    const { name, price, store_name, expiration_date } = req.body;
    const newIngredient = await Ingredient.create({
      user_id: req.user.id,
      name,
      price,
      store_name,
      expiration_date,
    });
    res.status(201).json(newIngredient);
  } catch (error) {
    res.status(400).json({ message: "Invalid data format." });
  }
};

// @desc    Update an ingredient (PUT/PATCH)
// @route   PATCH /api/ingredients/:id
export const updateIngredient = async (req: Request, res: Response) => {
  try {
    const updated = await Ingredient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: "Failed to update ingredient." });
  }
};

// @desc    Delete an ingredient
// @route   DELETE /api/ingredients/:id
export const deleteIngredient = async (req: Request, res: Response) => {
  try {
    await Ingredient.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Ingredient deleted successfully." });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete ingredient." });
  }
};
