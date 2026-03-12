import type { Recipe, RecipeGeneratorRequest } from '../models';

// Mock recipes
const mockRecipes: Recipe[] = [
  {
    id: 1,
    name: "Spinach Omelette",
    description: "A healthy and delicious spinach omelette with eggs",
    image: "🍳",
    cookTime: "15 mins",
    difficulty: "Easy",
    ingredients: ["Eggs", "Spinach", "Salt", "Pepper", "Butter"],
    instructions: [
      "Beat the eggs in a bowl",
      "Chop the spinach finely",
      "Heat butter in a pan",
      "Pour eggs and add spinach",
      "Cook until set and fold"
    ],
    matchPercentage: 85,
  },
  {
    id: 2,
    name: "Chicken Salad",
    description: "Fresh chicken salad with vegetables",
    image: "🥗",
    cookTime: "20 mins",
    difficulty: "Easy",
    ingredients: ["Chicken Breast", "Spinach", "Tomatoes", "Olive Oil", "Lemon"],
    instructions: [
      "Grill the chicken breast",
      "Chop vegetables",
      "Mix all ingredients",
      "Add dressing",
      "Serve fresh"
    ],
    matchPercentage: 92,
  },
  {
    id: 3,
    name: "Tomato Egg Scramble",
    description: "Quick and easy tomato scrambled eggs",
    image: "🍅",
    cookTime: "10 mins",
    difficulty: "Easy",
    ingredients: ["Eggs", "Tomatoes", "Salt", "Pepper", "Oil"],
    instructions: [
      "Beat eggs with salt and pepper",
      "Dice tomatoes",
      "Heat oil in pan",
      "Cook tomatoes first",
      "Add eggs and scramble"
    ],
    matchPercentage: 78,
  },
  {
    id: 4,
    name: "Chicken Spinach Pasta",
    description: "Creamy pasta with chicken and spinach",
    image: "🍝",
    cookTime: "30 mins",
    difficulty: "Medium",
    ingredients: ["Chicken Breast", "Spinach", "Pasta", "Cream", "Garlic"],
    instructions: [
      "Boil pasta according to package",
      "Cook chicken until golden",
      "Sauté garlic and spinach",
      "Add cream and chicken",
      "Toss with pasta and serve"
    ],
    matchPercentage: 65,
  },
];

export const recipeService = {
  // Get all recipes
  getAll: async (): Promise<Recipe[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockRecipes]), 300);
    });
  },

  // Get recipe by ID
  getById: async (id: number): Promise<Recipe | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const recipe = mockRecipes.find((r) => r.id === id);
        resolve(recipe);
      }, 300);
    });
  },

  // Generate recipes based on ingredients
  generateRecipes: async (request: RecipeGeneratorRequest): Promise<Recipe[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock: return recipes sorted by match percentage
        const sortedRecipes = [...mockRecipes].sort((a, b) => 
          (b.matchPercentage || 0) - (a.matchPercentage || 0)
        );
        resolve(sortedRecipes);
      }, 800);
    });
  },

  // Search recipes
  search: async (query: string): Promise<Recipe[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = mockRecipes.filter((recipe) =>
          recipe.name.toLowerCase().includes(query.toLowerCase()) ||
          recipe.description.toLowerCase().includes(query.toLowerCase()) ||
          recipe.ingredients.some(ing => ing.toLowerCase().includes(query.toLowerCase()))
        );
        resolve(results);
      }, 300);
    });
  },

  // Filter by difficulty
  filterByDifficulty: async (difficulty: 'Easy' | 'Medium' | 'Hard'): Promise<Recipe[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = mockRecipes.filter((recipe) => recipe.difficulty === difficulty);
        resolve(filtered);
      }, 300);
    });
  },
};
