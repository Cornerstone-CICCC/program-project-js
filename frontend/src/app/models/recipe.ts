export interface Recipe {
  id: number;
  name: string;
  description: string;
  image: string;
  cookTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: string[];
  instructions: string[];
  matchPercentage?: number;
}

export interface RecipeGeneratorRequest {
  selectedIngredients: number[];
  preferences?: {
    cuisine?: string;
    difficulty?: string;
    cookTime?: string;
  };
}
