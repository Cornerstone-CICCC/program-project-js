//add-ingredient.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { BottomNav } from "../components/BottomNav";
import { useIngredients } from "../hooks";

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

function getDaysLeft(targetDate: string) {
  const today = new Date();
  const target = new Date(targetDate);

  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function getStatus(daysLeft: number): "fresh" | "expiring" | "expired" {
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 3) return "expiring";
  return "fresh";
}

function getCategoryLabel(category: string) {
  const map: Record<string, string> = {
    vegetable: "Vegetable",
    fruit: "Fruit",
    dairy: "Dairy",
    meat: "Meat",
    seafood: "Seafood",
    grain: "Grain",
    other: "Other",
  };

  return map[category] ?? "Other";
}

function getCategoryImage(category: string) {
  const map: Record<string, string> = {
    vegetable: "🥬",
    fruit: "🍎",
    dairy: "🥛",
    meat: "🍖",
    seafood: "🐟",
    grain: "🌾",
    other: "📦",
  };

  return map[category] ?? "📦";
}

function formatExpiry(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AddIngredient() {
  const navigate = useNavigate();
  const { create } = useIngredients();

  const today = useMemo(() => getTodayString(), []);

  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("vegetable");
  const [buyDate, setBuyDate] = useState(today);
  const [expiryDate, setExpiryDate] = useState(today);
  const [isSaving, setIsSaving] = useState(false);

  const ddayLabel = useMemo(() => getDdayLabel(expiryDate), [expiryDate]);

  const fieldClassName =
    "w-full rounded-xl border border-transparent bg-input-background px-4 py-3 focus-visible:border-[#1d7d5e] focus-visible:ring-[3px] focus-visible:ring-[#1d7d5e]/20";

  const handleGoBack = () => {
    navigate("/ingredients");
  };

  const handleSave = async () => {
    const trimmedName = itemName.trim();

    if (!trimmedName) {
      alert("Please enter an item name.");
      return;
    }

    if (!expiryDate) {
      alert("Please select an expiration date.");
      return;
    }

    try {
      setIsSaving(true);

      const daysLeft = getDaysLeft(expiryDate);

      await create({
        name: trimmedName,
        category: getCategoryLabel(category),
        expiry: formatExpiry(expiryDate),
        daysLeft,
        status: getStatus(daysLeft),
        image: getCategoryImage(category),
        checked: false,
        buyDate,
        expirationDate: expiryDate,
        storeName: "My Fridge",
      });

      navigate("/ingredients");
    } catch (error) {
      console.error(error);
      alert("Failed to save ingredient.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card px-6 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={handleGoBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <h1 className="text-xl">Add Ingredient</h1>
        </div>
      </div>

      <div className="px-6 py-6 pb-44">
        <div className="mb-6">
          <div className="flex h-48 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-primary/30 bg-secondary/30 transition-colors hover:bg-secondary/40">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
              <Camera className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Tap to add photo</p>
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
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g., Tomatoes"
              className={fieldClassName}
            />
          </div>

          <div>
            <Label htmlFor="category" className="mb-2 block text-sm">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full rounded-xl border border-transparent bg-input-background px-4 focus-visible:border-[#1d7d5e] focus-visible:ring-[3px] focus-visible:ring-[#1d7d5e]/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vegetable">🥬 Vegetable</SelectItem>
                <SelectItem value="fruit">🍎 Fruit</SelectItem>
                <SelectItem value="dairy">🥛 Dairy</SelectItem>
                <SelectItem value="meat">🍖 Meat</SelectItem>
                <SelectItem value="seafood">🐟 Seafood</SelectItem>
                <SelectItem value="grain">🌾 Grain</SelectItem>
                <SelectItem value="other">📦 Other</SelectItem>
              </SelectContent>
            </Select>
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
                onChange={(e) => setBuyDate(e.target.value)}
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
                min={today}
                onChange={(e) => setExpiryDate(e.target.value)}
                className={fieldClassName}
              />
            </div>
          </div>

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
          onClick={handleSave}
          disabled={isSaving}
          className="w-full rounded-xl bg-[#1d7d5e] py-6 text-white hover:bg-[#17664c] disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
