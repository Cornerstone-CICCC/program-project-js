import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChefHat,
  Clock,
  Users,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { BottomNav } from "../components/BottomNav";

export function RecipeGenerator() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const selectedIngredients = [
    { id: 1, name: "Eggs", emoji: "🥚" },
    { id: 2, name: "Spinach", emoji: "🥬" },
    { id: 3, name: "Tomatoes", emoji: "🍅" },
    { id: 4, name: "Milk", emoji: "🥛" },
  ];

  const suggestedRecipes = [
    {
      id: 1,
      name: "Spinach & Tomato Omelette",
      image: "🍳",
      time: "15 min",
      servings: "2",
      difficulty: "Easy",
      matchRate: "95%",
      ingredients: ["Eggs", "Spinach", "Tomatoes"],
    },
    {
      id: 2,
      name: "Creamy Spinach Soup",
      image: "🥣",
      time: "25 min",
      servings: "4",
      difficulty: "Medium",
      matchRate: "88%",
      ingredients: ["Spinach", "Milk", "Garlic"],
    },
    {
      id: 3,
      name: "Tomato Egg Stir-Fry",
      image: "🍲",
      time: "10 min",
      servings: "2",
      difficulty: "Easy",
      matchRate: "82%",
      ingredients: ["Eggs", "Tomatoes", "Soy sauce"],
    },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);

    window.setTimeout(() => {
      setIsGenerating(false);
      setHasGenerated(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="bg-card px-6 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate("/ingredients")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <h1 className="text-xl">Recipe Generator</h1>

          <div className="ml-auto">
            <ChefHat className="w-6 h-6 text-primary" />
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* AI Banner */}
        <div className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-8 h-8 text-primary" />
            <h2 className="text-lg">AI Recipe Generator</h2>
          </div>

          <p className="text-sm text-muted-foreground">
            Get personalized recipes based on your ingredients and reduce food
            waste!
          </p>
        </div>

        {/* Selected Ingredients */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base">Your Ingredients</h2>

            <Button variant="ghost" size="sm" className="text-primary text-xs">
              Edit
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {selectedIngredients.map((ingredient) => (
              <div
                key={ingredient.id}
                className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2"
              >
                <span className="text-lg">{ingredient.emoji}</span>
                <span className="text-sm">{ingredient.name}</span>
                <button className="ml-1 text-muted-foreground hover:text-foreground">
                  ×
                </button>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            className="w-full rounded-xl py-6 border-dashed border-2"
          >
            + Add More Ingredients
          </Button>
        </div>

        {/* Generate Button */}
        {!hasGenerated && (
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-xl mb-6"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Generating Recipes...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Recipes
              </>
            )}
          </Button>
        )}

        {/* Suggested Recipes */}
        {hasGenerated && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base">Suggested Recipes</h2>

              <Button
                variant="ghost"
                size="sm"
                className="text-primary"
                onClick={handleGenerate}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {suggestedRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-card rounded-3xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-secondary/30 rounded-2xl flex items-center justify-center text-5xl flex-shrink-0">
                      {recipe.image}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-base mb-1">{recipe.name}</h3>

                        <Badge className="bg-primary/20 text-primary ml-2">
                          {recipe.matchRate}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{recipe.time}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{recipe.servings}</span>
                        </div>

                        <Badge variant="secondary" className="text-xs">
                          {recipe.difficulty}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {recipe.ingredients.map((ing, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-background px-2 py-1 rounded-full text-muted-foreground"
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-primary/10 text-primary hover:bg-primary/20 rounded-xl mt-4">
                    View Recipe
                  </Button>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="mt-8 bg-secondary/20 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💡</div>

                <div>
                  <h3 className="text-sm mb-1">Cooking Tip</h3>
                  <p className="text-xs text-muted-foreground">
                    Use your expiring ingredients first! Spinach and tomatoes
                    are best when fresh.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasGenerated && !isGenerating && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-secondary/30 rounded-full flex items-center justify-center text-5xl mx-auto mb-4">
              🍳
            </div>

            <h3 className="text-base mb-2">Ready to Cook?</h3>

            <p className="text-sm text-muted-foreground">
              Select your ingredients and let AI suggest delicious recipes!
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}