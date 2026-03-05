// src/app/pages/recipes/RecipePage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChefHat, Clock, Users, Sparkles, RefreshCw } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

import { useIngredients } from "../../hooks/useIngredients";
import { recipeService } from "../../services/recipeService";
import type { RecipeLog } from "../../models/recipe";

function emojiForIngredient(name: string) {
  const n = name.toLowerCase();
  if (n.includes("egg")) return "🥚";
  if (n.includes("spinach")) return "🥬";
  if (n.includes("tomato")) return "🍅";
  if (n.includes("milk")) return "🥛";
  if (n.includes("bread")) return "🥖";
  if (n.includes("onion")) return "🧅";
  if (n.includes("garlic")) return "🧄";
  if (n.includes("chicken")) return "🍗";
  if (n.includes("pork") || n.includes("beef") || n.includes("meat")) return "🥩";
  if (n.includes("fish")) return "🐟";
  return "🍽️";
}

export default function RecipePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("ff_token");

  // pull my ingredients so user can pick
  const { items: myIngredients, isLoading: ingLoading, error: ingError } = useIngredients(token);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [generatedText, setGeneratedText] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);

  const [logs, setLogs] = useState<RecipeLog[]>([]);

  const selectedIngredients = useMemo(() => {
    return myIngredients
      .filter((i) => selectedIds.has(i.id))
      .map((i) => ({ id: i.id, name: i.name, emoji: emojiForIngredient(i.name) }));
  }, [myIngredients, selectedIds]);

  const ingredientsUsedText = useMemo(() => {
    return selectedIngredients.map((x) => x.name).join(", ");
  }, [selectedIngredients]);

  const canGenerate = useMemo(() => selectedIngredients.length > 0 && !!token, [selectedIngredients.length, token]);

  async function loadLogs() {
    if (!token) return;
    try {
      const data = await recipeService.listLogs(token);
      setLogs([...data].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    } catch {
      // logs optional
    }
  }

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function removeSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function handleGenerate() {
    if (!token) {
      setErr("Not authenticated. Please log in again.");
      return;
    }
    if (!canGenerate) {
      setErr("Select at least 1 ingredient.");
      return;
    }

    setErr(null);
    setIsGenerating(true);

    try {
      const res = await recipeService.generate({ ingredientsUsed: ingredientsUsedText }, token);
      setGeneratedText(res.generatedRecipe);
      setHasGenerated(true);

      // Save log (best-effort)
      try {
        const log = await recipeService.createLog(
          { ingredientsUsed: ingredientsUsedText, generatedRecipe: res.generatedRecipe },
          token
        );
        setLogs((prev) => [log, ...prev]);
      } catch {
        // ignore save failure
      }
    } catch (e: any) {
      setErr(e?.message ?? "Failed to generate recipe");
      setHasGenerated(false);
      setGeneratedText("");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleReset() {
    setHasGenerated(false);
    setGeneratedText("");
    setErr(null);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card px-6 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            type="button"
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
            Pick ingredients from your fridge and generate a recipe to reduce food waste!
          </p>
        </div>

        {/* Selected Ingredients */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base">Your Ingredients</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary text-xs"
              type="button"
              onClick={clearSelection}
              disabled={selectedIngredients.length === 0}
            >
              Clear
            </Button>
          </div>

          {/* Selected pills (Figma style) */}
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedIngredients.map((ingredient) => (
              <div
                key={ingredient.id}
                className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2"
              >
                <span className="text-lg">{ingredient.emoji}</span>
                <span className="text-sm">{ingredient.name}</span>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground ml-1"
                  onClick={() => removeSelected(ingredient.id)}
                  aria-label="Remove ingredient"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Add more ingredients (real list) */}
          <div className="bg-card rounded-3xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm">Select from My Ingredients</div>
              <Badge className="bg-primary/20 text-primary">{selectedIngredients.length} selected</Badge>
            </div>

            {ingLoading && <div className="text-sm text-muted-foreground">Loading your ingredients...</div>}
            {ingError && (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {ingError}
              </div>
            )}

            {!ingLoading && !ingError && myIngredients.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No ingredients yet. Add items first.
              </div>
            )}

            <div className="mt-2 grid grid-cols-2 gap-2">
              {myIngredients.slice(0, 10).map((i) => {
                const checked = selectedIds.has(i.id);
                return (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => toggleSelected(i.id)}
                    className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition-colors ${
                      checked ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/20"
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="text-lg">{emojiForIngredient(i.name)}</span>
                      <span className="truncate">{i.name}</span>
                    </span>
                    <span className={`text-xs ${checked ? "text-primary" : "text-muted-foreground"}`}>
                      {checked ? "✓" : "+"}
                    </span>
                  </button>
                );
              })}
            </div>

            <Button
              variant="outline"
              className="w-full rounded-xl py-6 border-dashed border-2 mt-3"
              type="button"
              onClick={() => navigate("/ingredients")}
            >
              + Add More Ingredients
            </Button>
          </div>
        </div>

        {err && (
          <div className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {err}
          </div>
        )}

        {/* Generate Button */}
        {!hasGenerated && (
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !canGenerate}
            className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-xl mb-6 disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Recipe
              </>
            )}
          </Button>
        )}

        {/* Generated Result (Figma suggested recipe card style) */}
        {hasGenerated && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base">Suggested Recipe</h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary"
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !canGenerate}
                title="Regenerate"
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
              </Button>
            </div>

            <div className="bg-card rounded-3xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-secondary/30 rounded-2xl flex items-center justify-center text-5xl flex-shrink-0">
                  🍳
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-base mb-1">AI Generated Recipe</h3>
                    <Badge className="bg-primary/20 text-primary ml-2">Match</Badge>
                  </div>

                  <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>~20 min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>1-2</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Easy
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {selectedIngredients.map((ing) => (
                      <span
                        key={ing.id}
                        className="text-xs bg-background px-2 py-1 rounded-full text-muted-foreground"
                      >
                        {ing.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                type="button"
                className="w-full bg-primary/10 text-primary hover:bg-primary/20 rounded-xl mt-4"
                onClick={() => {
                  // scroll to recipe text block
                  const el = document.getElementById("generated-recipe-text");
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                View Recipe
              </Button>
            </div>

            {/* Generated text */}
            <div id="generated-recipe-text" className="mt-4 bg-card rounded-2xl p-4 border border-border">
              <h3 className="text-sm mb-2">Recipe</h3>
              <pre className="whitespace-pre-wrap text-sm text-muted-foreground">{generatedText}</pre>

              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => navigator.clipboard.writeText(generatedText)}
                >
                  Copy
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-8 bg-secondary/20 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💡</div>
                <div>
                  <h3 className="text-sm mb-1">Cooking Tip</h3>
                  <p className="text-xs text-muted-foreground">
                    Use your expiring ingredients first. Pick the ones closest to the expiration date!
                  </p>
                </div>
              </div>
            </div>

            {/* Recent logs (optional but useful) */}
            {logs.length > 0 && (
              <div className="mt-8">
                <h2 className="text-base mb-3">Recent Recipe Logs</h2>
                <div className="space-y-3">
                  {logs.slice(0, 3).map((l) => (
                    <div key={l.id} className="bg-card rounded-2xl p-4 border border-border">
                      <div className="text-sm mb-1">{l.ingredientsUsed}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(l.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              Select ingredients from your fridge and let AI suggest a recipe!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}