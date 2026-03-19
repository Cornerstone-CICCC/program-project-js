import { Request, Response } from "express";
import { Ingredient } from "../models/Ingredient";
import { SharedPost } from "../models/SharedPost";

/**
 * Helper: Auto-categorize based on keywords.
 * Returns lowercase strings to match Frontend mapping keys.
 */
const autoCategorize = (name: string): string => {
  const map: { [key: string]: string[] } = {
    meat: [
      "소",
      "돼지",
      "닭",
      "고기",
      "beef",
      "pork",
      "chicken",
      "삼겹살",
      "스테이크",
    ],
    seafood: [
      "연어",
      "새우",
      "생선",
      "고등어",
      "오징어",
      "salmon",
      "shrimp",
      "fish",
      "squid",
    ],
    vegetable: [
      "양파",
      "당근",
      "마늘",
      "배추",
      "감자",
      "onion",
      "garlic",
      "carrot",
      "potato",
    ],
    dairy: [
      "우유",
      "치즈",
      "버터",
      "요거트",
      "milk",
      "cheese",
      "butter",
      "yogurt",
    ],
    fruit: [
      "사과",
      "바나나",
      "포도",
      "딸기",
      "apple",
      "banana",
      "berry",
      "grape",
    ],
    grain: ["쌀", "밀가루", "콩", "rice", "grain", "flour", "bean"],
  };

  const lowerName = name.toLowerCase();
  for (const [cat, keywords] of Object.entries(map)) {
    if (keywords.some((k) => lowerName.includes(k))) return cat;
  }
  return "other"; // Default to 'other' (lowercase) if no match
};

// @desc    Get my ingredient list
export const getIngredients = async (req: any, res: Response) => {
  try {
    const ingredients = await Ingredient.find({ user_id: req.user.id }).sort({
      expiration_date: 1, // Sort by closest expiration date
    });
    res.status(200).json(ingredients);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve ingredients." });
  }
};

// @desc    Get expiry alerts (within 3 days)
export const getExpiryAlerts = async (req: any, res: Response) => {
  try {
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);

    const alerts = await Ingredient.find({
      user_id: req.user.id,
      expiration_date: {
        $gte: today,
        $lte: threeDaysLater,
      },
    }).sort({ expiration_date: 1 });

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch expiry alerts." });
  }
};

// @desc    Add a new ingredient
export const createIngredient = async (req: any, res: Response) => {
  try {
    const {
      name,
      category: selectedCategory, // Category sent from Frontend
      price,
      store_name,
      purchased_date,
      expiration_date,
      photo_url,
    } = req.body;

    if (!name || !purchased_date || !expiration_date) {
      return res.status(400).json({
        message: "Name, purchased date, and expiration date are required.",
      });
    }

    // PRIORITY: Use selectedCategory if provided, otherwise use autoCategorize
    const finalCategory = selectedCategory || autoCategorize(name);

    const newIngredient = await Ingredient.create({
      user_id: req.user.id,
      name,
      category: finalCategory,
      price: price || 0,
      store_name: store_name || "My Fridge",
      purchased_date,
      expiration_date,
      photo_url,
    });

    res.status(201).json(newIngredient);
  } catch (error: any) {
    console.error("Create Error:", error.message);
    res
      .status(400)
      .json({ message: "Invalid data format.", error: error.message });
  }
};

// @desc    Update an ingredient
export const updateIngredient = async (req: Request, res: Response) => {
  try {
    // If the user updates the name but not the category,
    // you might want to re-run autoCategorize here,
    // but usually, it's safer to trust req.body sent from the edit form.
    const updated = await Ingredient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!updated) {
      return res.status(404).json({ message: "Ingredient not found." });
    }

    res.status(200).json(updated);
  } catch (error: any) {
    res
      .status(400)
      .json({ message: "Failed to update ingredient.", error: error.message });
  }
};

// @desc    Delete an ingredient
export const deleteIngredient = async (req: Request, res: Response) => {
  try {
    const deleted = await Ingredient.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Ingredient not found." });
    }
    res.status(200).json({ message: "Ingredient deleted successfully." });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete ingredient." });
  }
};

// @desc    Update post status
export const updatePostStatus = async (req: any, res: Response) => {
  try {
    const { status } = req.body;
    const validStatuses = ["available", "completed", "canceled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const post = await SharedPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (post.user_id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this post." });
    }

    post.status = status;
    await post.save();

    res.status(200).json(post);
  } catch (error) {
    res.status(400).json({ message: "Failed to update post status." });
  }
};
