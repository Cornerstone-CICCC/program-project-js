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
import axios from "axios";

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
    if (!imageFile) return alert("Please take or select a photo.");

    try {
      setIsSaving(true);

      // 1. 위치 정보 가져오기 (Promise로 감싸서 위치 정보를 기다림)
      let locationData = { type: "Point", coordinates: [0, 0] };
      try {
        if ("geolocation" in navigator) {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
              });
            },
          );
          // 🔴 MongoDB GeoJSON 형식: [경도(lng), 위도(lat)] 순서 주의!
          locationData = {
            type: "Point",
            coordinates: [position.coords.longitude, position.coords.latitude],
          };
        }
      } catch (geoError) {
        console.warn(
          "Location access denied or timed out. Saving with default coords.",
          geoError,
        );
        // 위치 권한을 거부해도 등록은 가능하게 하려면 여기서 alert를 띄우지 않고 진행합니다.
      }

      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append("file", imageFile);
      cloudinaryFormData.append("upload_preset", "Project");
      const cloudName = "dwc2isol3";

      const cloudRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        cloudinaryFormData,
      );

      const imageUrl = cloudRes.data.secure_url;

      // --- 2. 서비스 전송을 위한 FormData 생성 ---
      // shareService.create가 FormData를 요구하므로 형식에 맞춰줍니다.
      const finalFormData = new FormData();
      finalFormData.append("ingredient_name", itemName);
      finalFormData.append("category", category);
      finalFormData.append("expiration_date", expiryDate);
      finalFormData.append("pickup_type", pickupType);
      finalFormData.append("description", description);
      finalFormData.append("photo_url", imageUrl);

      finalFormData.append("location", JSON.stringify(locationData));

      // 이제 타입 에러 없이 전송됩니다!
      await shareService.create(finalFormData);

      alert("Shared successfully!");
      navigate("/share");
    } catch (error: any) {
      // 🟢 에러 상세 분석 로그
      console.error("Cloudinary Error Response:", error.response?.data);
      alert(
        `Upload Failed: ${error.response?.data?.error?.message || "Unknown Error"}`,
      );
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
