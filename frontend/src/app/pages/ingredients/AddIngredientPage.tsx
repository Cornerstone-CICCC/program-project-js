// src/app/pages/ingredients/AddIngredientPage.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Calendar as CalendarIcon } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

import { useIngredients } from "../../hooks/useIngredients";
import { daysUntil } from "../../utils/dateUtils";

export default function AddIngredientPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("ff_token");
  const { create } = useIngredients(token);

  // Figma fields
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("vegetable");
  const [buyDate, setBuyDate] = useState(""); // UI only (not in ERD)
  const [expiryDate, setExpiryDate] = useState("");

  // ERD-required fields (not in figma UI originally)
  const [storeName, setStoreName] = useState("");
  const [price, setPrice] = useState<number>(0);

  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const dLeft = useMemo(() => (expiryDate ? daysUntil(expiryDate) : null), [expiryDate]);

  const canSave = useMemo(() => {
    return itemName.trim().length > 0 && expiryDate.trim().length > 0;
  }, [itemName, expiryDate]);

  async function handleSave() {
    if (!token) {
      setErr("Not authenticated. Please log in again.");
      return;
    }
    if (!canSave) {
      setErr("Please enter Item Name and Expiration Date.");
      return;
    }

    setErr(null);
    setSaving(true);

    try {
      await create({
        name: itemName.trim(),
        price: Number.isFinite(price) ? price : 0,
        storeName: storeName.trim(),
        expirationDate: expiryDate, // YYYY-MM-DD
      });

      navigate("/ingredients", { replace: true });
    } catch (e: any) {
      setErr(e?.message ?? "Failed to save ingredient");
    } finally {
      setSaving(false);
    }
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
            onClick={() => navigate("/ingredients")}
            type="button"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <h1 className="text-xl">Add Ingredient</h1>

          <div className="ml-auto w-10 h-10 bg-primary/20 rounded-full overflow-hidden flex items-center justify-center">
            <span className="text-xl">👤</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Image Upload (UI only for now) */}
        <div className="mb-6">
          <button
            type="button"
            className="w-full h-48 bg-secondary/30 rounded-3xl flex flex-col items-center justify-center gap-3 border-2 border-dashed border-primary/30 cursor-pointer hover:bg-secondary/40 transition-colors"
            onClick={() => alert("Photo upload: coming soon")}
          >
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Camera className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Tap to add photo</p>
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          <div>
            <Label htmlFor="itemName" className="text-sm mb-2 block">
              Item Name
            </Label>
            <Input
              id="itemName"
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g., Tomatoes"
              className="w-full px-4 py-3 bg-input-background rounded-xl border-0"
            />
          </div>

          {/* ERD fields added (Store + Price) */}
          <div>
            <Label htmlFor="storeName" className="text-sm mb-2 block">
              Store Bought
            </Label>
            <Input
              id="storeName"
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g., Costco"
              className="w-full px-4 py-3 bg-input-background rounded-xl border-0"
            />
          </div>

          <div>
            <Label htmlFor="price" className="text-sm mb-2 block">
              Price (CAD)
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={Number.isFinite(price) ? price : 0}
              onChange={(e) => setPrice(Number(e.target.value))}
              placeholder="e.g., 4.99"
              className="w-full px-4 py-3 bg-input-background rounded-xl border-0"
            />
          </div>

          {/* UI only (category not in ERD yet) */}
          <div>
            <Label htmlFor="category" className="text-sm mb-2 block">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full px-4 py-3 bg-input-background rounded-xl border-0">
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
            <p className="mt-1 text-xs text-muted-foreground">
              (UI only for now — add DB column later if you want to store it)
            </p>
          </div>

          {/* UI only (buy date not in ERD) */}
          <div>
            <Label htmlFor="buyDate" className="text-sm mb-2 block">
              Buy Date
            </Label>
            <div className="relative">
              <Input
                id="buyDate"
                type="date"
                value={buyDate}
                onChange={(e) => setBuyDate(e.target.value)}
                className="w-full px-4 py-3 bg-input-background rounded-xl border-0"
              />
              <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Expiration date (ERD field) */}
          <div>
            <Label htmlFor="expiryDate" className="text-sm mb-2 block flex items-center gap-2">
              Expiration Date
              {typeof dLeft === "number" && (
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    dLeft < 0
                      ? "bg-neutral-900 text-white"
                      : dLeft <= 3
                      ? "bg-destructive/10 text-destructive"
                      : "bg-secondary/40 text-foreground"
                  }`}
                >
                  {dLeft < 0 ? "Expired" : `D-${dLeft}`}
                </span>
              )}
            </Label>
            <div className="relative">
              <Input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-4 py-3 bg-input-background rounded-xl border-0"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  className="h-8 text-xs bg-primary/10 text-primary rounded-lg"
                  onClick={() => {
                    // Simple auto: set expiry = today + 7 days (beginner-friendly)
                    const now = new Date();
                    now.setDate(now.getDate() + 7);
                    const y = now.getFullYear();
                    const m = String(now.getMonth() + 1).padStart(2, "0");
                    const d = String(now.getDate()).padStart(2, "0");
                    setExpiryDate(`${y}-${m}-${d}`);
                  }}
                >
                  📅 Auto
                </Button>
              </div>
            </div>
          </div>

          {/* Storage Tips (static for now) */}
          <div className="bg-secondary/20 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h3 className="text-sm mb-1">Storage Tip</h3>
                <p className="text-xs text-muted-foreground">
                  Store tomatoes at room temperature for best flavor. Refrigerate only when fully ripe.
                </p>
              </div>
            </div>
          </div>

          {err && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              {err}
            </div>
          )}
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-xl mt-8 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}