import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { BottomNav } from "../components/BottomNav";
import { shareService } from "../services/shareService";

function getTodayString() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

export function AddShare() {
  const navigate = useNavigate();
  const today = useMemo(() => getTodayString(), []);

  // 상태 관리 (AddIngredient와 동일한 스타일)
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("vegetable");
  const [expiryDate, setExpiryDate] = useState(today);
  const [pickupType, setPickupType] = useState<"Free" | "Pickup">("Free");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fieldClassName =
    "w-full rounded-xl border border-transparent bg-input-background px-4 py-3 focus-visible:border-[#1d7d5e] focus-visible:ring-[3px] focus-visible:ring-[#1d7d5e]/20";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!itemName.trim()) return alert("Please enter an item name.");

    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append("ingredient_name", itemName);
      formData.append("category", category);
      formData.append("expiration_date", expiryDate);
      formData.append("pickup_type", pickupType);
      formData.append("description", description);
      if (imageFile) formData.append("image", imageFile);

      await shareService.create(formData);
      alert("Shared successfully!");
      navigate("/share");
    } catch (error) {
      console.error(error);
      alert("Failed to share item.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header: AddIngredient와 동일 디자인 */}
      <div className="bg-card px-6 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl">Share Food</h1>
        </div>
      </div>

      <div className="px-6 py-6 pb-44">
        {/* Photo Area: AddIngredient와 동일 디자인 */}
        <div className="mb-6">
          <label className="flex h-48 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-primary/30 bg-secondary/30 overflow-hidden relative transition-colors hover:bg-secondary/40">
            {previewUrl ? (
              <img
                src={previewUrl}
                className="w-full h-full object-cover"
                alt="Preview"
              />
            ) : (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                  <Camera className="h-8 w-8 text-[#1d7d5e]" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Tap to add food photo
                </p>
              </>
            )}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>
        </div>

        <div className="space-y-5">
          {/* Item Name */}
          <div>
            <Label className="mb-2 block text-sm">Item Name</Label>
            <Input
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g., Organic Carrots"
              className={fieldClassName}
            />
          </div>

          {/* Category & Pickup Type Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block text-sm">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full rounded-xl border border-transparent bg-input-background px-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vegetable">🥬 Vegetable</SelectItem>
                  <SelectItem value="fruit">🍎 Fruit</SelectItem>
                  <SelectItem value="dairy">🥛 Dairy</SelectItem>
                  <SelectItem value="meat">🍖 Meat</SelectItem>
                  <SelectItem value="other">📦 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block text-sm">Sharing Type</Label>
              <Select
                value={pickupType}
                onValueChange={(v: any) => setPickupType(v)}
              >
                <SelectTrigger className="w-full rounded-xl border border-transparent bg-input-background px-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Free">🎁 Free</SelectItem>
                  <SelectItem value="Pickup">🤝 Pickup</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Expiry Date */}
          <div>
            <Label className="mb-2 block text-sm">Expiration Date</Label>
            <Input
              type="date"
              value={expiryDate}
              min={today}
              onChange={(e) => setExpiryDate(e.target.value)}
              className={fieldClassName}
            />
          </div>

          {/* Description */}
          <div>
            <Label className="mb-2 block text-sm">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell others about this item (e.g., unopened, bought yesterday)"
              className="w-full rounded-xl border border-transparent bg-input-background px-4 py-3 min-h-[120px] focus-visible:border-[#1d7d5e] focus-visible:ring-[3px] focus-visible:ring-[#1d7d5e]/20"
            />
          </div>
        </div>
      </div>

      {/* Fixed Save Button: AddIngredient와 동일 디자인 */}
      <div className="fixed inset-x-0 bottom-[76px] z-40 bg-background px-6 pb-4 pt-3">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full rounded-xl bg-[#1d7d5e] py-6 text-white hover:bg-[#17664c] disabled:opacity-60"
        >
          {isSaving ? "Sharing..." : "Share Now"}
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
