import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Camera, Calendar as CalendarIcon } from "lucide-react";
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

export function AddIngredient() {
  const navigate = useNavigate();
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("vegetable");
  const [buyDate, setBuyDate] = useState("2025-04-20");
  const [expiryDate, setExpiryDate] = useState("2025-04-28");

  const handleSave = () => {
    // Save logic here
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card px-6 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate("/")}
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
        {/* Image Upload */}
        <div className="mb-6">
          <div className="w-full h-48 bg-secondary/30 rounded-3xl flex flex-col items-center justify-center gap-3 border-2 border-dashed border-primary/30 cursor-pointer hover:bg-secondary/40 transition-colors">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Camera className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Tap to add photo</p>
          </div>
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
          </div>

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

          <div>
            <Label htmlFor="expiryDate" className="text-sm mb-2 block flex items-center gap-2">
              Expiration Date
              <span className="px-2 py-0.5 bg-destructive/10 text-destructive text-xs rounded-full">
                D-D
              </span>
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
                  className="h-8 text-xs bg-primary/10 text-primary rounded-lg"
                >
                  📅 Auto
                </Button>
              </div>
            </div>
          </div>

          {/* Storage Tips */}
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
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-xl mt-8"
        >
          Save
        </Button>
      </div>
      <BottomNav />
    </div>
  );
}
