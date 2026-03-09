// src/app/pages/ingredients/AddIngredientPage.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera } from "lucide-react"; // CalendarIcon 제거

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

  // States
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("vegetable");
  // buyDate 관련 state는 사용하지 않으므로 제거
  const [expiryDate, setExpiryDate] = useState("");
  const [storeName, setStoreName] = useState("");
  const [price, setPrice] = useState<string>(""); 

  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const dLeft = useMemo(
    () => (expiryDate ? daysUntil(expiryDate) : null),
    [expiryDate],
  );

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
      // ⭐ 백엔드 필드명과 일치시키되, 타입 에러 방지를 위해 'as any' 사용
      await create({
        name: itemName.trim(),
        price: Number(price) || 0,
        store_name: storeName.trim(),
        expiration_date: expiryDate,
        is_shared: false,
      } as any);

      navigate("/ingredients", { replace: true });
    } catch (e: any) {
      setErr(
        e?.response?.data?.message ?? e?.message ?? "Failed to save ingredient",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
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
          <h1 className="text-xl font-semibold">Add Ingredient</h1>
        </div>
      </div>

      <div className="px-6 py-6 max-w-md mx-auto">
        {/* Image Upload Area */}
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
            <Label htmlFor="itemName" className="text-sm font-medium mb-2 block">
              Item Name
            </Label>
            <Input
              id="itemName"
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g., Organic Milk"
              className="w-full px-4 py-3 bg-card rounded-xl border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="storeName" className="text-sm font-medium mb-2 block">
                Store
              </Label>
              <Input
                id="storeName"
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Costco"
                className="w-full px-4 py-3 bg-card rounded-xl border-border"
              />
            </div>
            <div>
              <Label htmlFor="price" className="text-sm font-medium mb-2 block">
                Price
              </Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="3500"
                className="w-full px-4 py-3 bg-card rounded-xl border-border"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category" className="text-sm font-medium mb-2 block">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full px-4 py-3 bg-card rounded-xl border-border">
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

          <div>
            <Label htmlFor="expiryDate" className="text-sm font-medium mb-2 block flex items-center gap-2">
              Expiration Date
              {typeof dLeft === "number" && (
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    dLeft < 0
                      ? "bg-black text-white"
                      : dLeft <= 3
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
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
                className="w-full px-4 py-3 bg-card rounded-xl border-border"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  className="h-7 text-[10px] bg-primary/10 text-primary hover:bg-primary/20"
                  onClick={() => {
                    const now = new Date();
                    now.setDate(now.getDate() + 7);
                    setExpiryDate(now.toISOString().split("T")[0]);
                  }}
                >
                  +7 Days
                </Button>
              </div>
            </div>
          </div>

          {err && (
            <div className="p-3 rounded-lg bg-red-50 text-red-500 text-xs border border-red-100">
              ⚠️ {err}
            </div>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || !canSave}
          className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-xl mt-8 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
        >
          {saving ? "Saving..." : "Save Ingredient"}
        </Button>
      </div>
    </div>
  );
}