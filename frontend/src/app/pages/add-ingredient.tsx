import { useMemo, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../hooks";
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

export function AddIngredient() {
  const navigate = useNavigate();
  const { create } = useIngredients();
  const { user } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const today = useMemo(() => getTodayString(), []);

  // UI 상태값들은 그대로 유지합니다 (화면 입력용)
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

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 이미지 선택 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // 미리보기 생성
    }
  };

  const handleSave = async () => {
    const trimmedName = itemName.trim();
    if (!trimmedName) return alert("Please enter an item name.");
    if (!user?._id) return alert("Please log in first.");
    try {
      setIsSaving(true);
      let imageUrl = "";

      // --- 1. Cloudinary 이미지 업로드 로직 ---
      if (imageFile) {
        const cloudinaryFormData = new FormData();
        cloudinaryFormData.append("file", imageFile);
        cloudinaryFormData.append("upload_preset", "Project"); // 본인의 프리셋 확인
        const cloudName = "dwc2isol3";

        const cloudRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          cloudinaryFormData,
        );
        imageUrl = cloudRes.data.secure_url;
      }

      // 백엔드 Ingredient 인터페이스 형식에 맞춰서 데이터 조립
      await create({
        name: trimmedName,
        category: category,
        purchased_date: buyDate,
        expiration_date: expiryDate,
        is_shared: false,
        store_name: "My Fridge",
        user_id: user._id,
        photo_url: imageUrl, // 👈 이 줄이 빠져있었습니다!
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
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageChange}
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex h-48 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-primary/30 bg-secondary/30 overflow-hidden"
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Tap to add photo</p>
            </>
          )}
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

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-600 ml-1">
              Category
            </Label>
            <Select
              value={category}
              onValueChange={setCategory} // 상태 업데이트 연결 확인
            >
              <SelectTrigger className="w-full rounded-2xl border-none bg-white px-4 py-7 shadow-sm">
                {/* 4. SelectValue에 현재 상태가 표시되도록 함 */}
                <SelectValue>
                  {category
                    ? category.charAt(0).toUpperCase() + category.slice(1)
                    : "Select Category"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-xl">
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

          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="buyDate" className="mb-2 block text-sm">
                Buy Date
              </Label>
              <Input
                id="buyDate"
                type="date"
                value={buyDate}
                onChange={(e) => setBuyDate(e.target.value)}
                className="w-full rounded-2xl border-none bg-white px-3 py-6 shadow-sm text-sm"
              />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between px-1">
                <Label className="text-sm font-semibold text-slate-600">
                  Expiration
                </Label>
                <span className="text-[10px] font-bold bg-red-50 text-red-400 px-1.5 py-0.5 rounded-md">
                  {ddayLabel}
                </span>
              </div>
              <div className="relative">
                <Input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full rounded-2xl border-none bg-white px-3 py-6 shadow-sm text-sm"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-secondary/20 p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h3 className="mb-1 text-sm">Storage Tip</h3>
                <p className="text-xs text-muted-foreground">
                  Store {itemName || "items"} properly to keep them fresh
                  longer.
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
