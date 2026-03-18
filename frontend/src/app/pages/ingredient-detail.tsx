//pages/ingredient-detail.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Camera, Pencil } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { BottomNav } from "../components/BottomNav";
import { useIngredients } from "../hooks";
import { useToast } from "../components/ui/use-toast";

function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDdayLabel(targetDate: string) {
  if (!targetDate) return "D-D";

  const today = new Date();
  const target = new Date(targetDate);

  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "D-Day";
  if (diffDays > 0) return `D-${diffDays}`;
  return `D+${Math.abs(diffDays)}`;
}

function getCategoryLabel(category: string) {
  const map: Record<string, string> = {
    vegetable: "🥬 Vegetable",
    fruit: "🍎 Fruit",
    dairy: "🥛 Dairy",
    meat: "🍖 Meat",
    seafood: "🐟 Seafood",
    grain: "🌾 Grain",
    other: "📦 Other",
    general: "📦 General",
  };

  return map[category.toLowerCase()] ?? "📦 Other";
}

export function IngredientDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { ingredients, loading, update } = useIngredients();
  const { toast } = useToast();

  const today = useMemo(() => getTodayString(), []);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("other");
  const [buyDate, setBuyDate] = useState(today);
  const [expiryDate, setExpiryDate] = useState(today);

  const ingredientId = id ?? "";
  const ingredient = ingredients.find((item) => item._id === ingredientId);

  useEffect(() => {
    if (!ingredient || isInitialized) return;

    setItemName(ingredient.name || "");
    setCategory(ingredient.category || "other");
    setBuyDate(ingredient.purchased_date || today);
    setExpiryDate(ingredient.expiration_date || today);
    setIsInitialized(true);
  }, [ingredient, isInitialized, today]);

  const ddayLabel = useMemo(() => getDdayLabel(expiryDate), [expiryDate]);

  const fieldClassName =
    "w-full rounded-xl border border-transparent bg-input-background px-4 py-3";

  const handleGoBack = () => {
    navigate("/ingredients");
  };

  const handleGoToEdit = () => {
    navigate(`/ingredients/${ingredientId}/edit`);
  };

  const handleToggleShare = async () => {
    if (!ingredientId || !ingredient) return;

    try {
      setIsSharing(true);

      const nextSharedState = !ingredient.is_shared;

      await update(ingredientId, {
        name: ingredient.name,
        category: ingredient.category,
        price: ingredient.price,
        store_name: ingredient.store_name,
        purchased_date: ingredient.purchased_date,
        expiration_date: ingredient.expiration_date,
        is_shared: nextSharedState,
        user_id: ingredient.user_id,
      });

      toast({
        title: nextSharedState ? "Shared successfully" : "Share canceled",
        description: nextSharedState
          ? `${ingredient.name} has been added to shared items.`
          : `${ingredient.name} has been removed from shared items.`,
      });

      if (nextSharedState) {
        navigate("/share");
      }
    } catch (error) {
      console.error(error);

      toast({
        title: ingredient.is_shared
          ? "Failed to cancel share"
          : "Failed to share item",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  if (loading && !isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading ingredient...</p>
      </div>
    );
  }

  if (!ingredient && !loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-muted-foreground">Ingredient not found.</p>
        <Button
          type="button"
          onClick={() => navigate("/ingredients")}
          className="cursor-pointer bg-[#1d7d5e] text-white hover:bg-[#17664c]"
        >
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="cursor-pointer rounded-full"
              onClick={handleGoBack}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <h1 className="text-xl">Ingredient Detail</h1>
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={handleGoToEdit}
            className="cursor-pointer flex items-center gap-2 rounded-full px-3"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="px-6 py-6 pb-44">
        <div className="mb-6">
          <div className="flex h-48 w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-primary/30 bg-secondary/30">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
              <Camera className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Ingredient photo</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <Label htmlFor="itemName" className="mb-2 block text-sm">
              Item Name
            </Label>
            <Input
              id="itemName"
              type="text"
              value={itemName}
              readOnly
              className={fieldClassName}
            />
          </div>

          <div>
            <Label htmlFor="category" className="mb-2 block text-sm">
              Category
            </Label>
            <Input
              id="category"
              type="text"
              value={getCategoryLabel(category)}
              readOnly
              className={fieldClassName}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="buyDate" className="mb-2 block text-sm">
                Buy Date
              </Label>
              <Input
                id="buyDate"
                type="date"
                value={buyDate}
                readOnly
                className={fieldClassName}
              />
            </div>

            <div>
              <Label
                htmlFor="expiryDate"
                className="mb-2 flex items-center gap-2 text-sm"
              >
                Expiration Date
                <span className="rounded-full bg-[#1d7d5e]/10 px-2 py-0.5 text-xs text-[#1d7d5e]">
                  {ddayLabel}
                </span>
              </Label>
              <Input
                id="expiryDate"
                type="date"
                value={expiryDate}
                readOnly
                className={fieldClassName}
              />
            </div>
          </div>

          {ingredient?.is_shared && (
            <div className="rounded-2xl border border-[#1d7d5e]/20 bg-[#1d7d5e]/5 p-4">
              <p className="text-sm text-[#1d7d5e]">
                This ingredient is currently shared.
              </p>
            </div>
          )}

          <div className="rounded-2xl bg-secondary/20 p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h3 className="mb-1 text-sm">Storage Tip</h3>
                <p className="text-xs text-muted-foreground">
                  Store tomatoes at room temperature for best flavor.
                  Refrigerate only when fully ripe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-[76px] z-40 bg-background px-6 pb-4 pt-3">
        <Button
          type="button"
          onClick={handleToggleShare}
          disabled={isSharing}
          className={`cursor-pointer w-full rounded-xl py-6 text-white disabled:opacity-60 ${
            ingredient?.is_shared
              ? "bg-red-500 hover:bg-red-600"
              : "bg-[#1d7d5e] hover:bg-[#17664c]"
          }`}
        >
          {isSharing
            ? ingredient?.is_shared
              ? "Canceling..."
              : "Sharing..."
            : ingredient?.is_shared
              ? "Cancel Share"
              : "Share"}
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}