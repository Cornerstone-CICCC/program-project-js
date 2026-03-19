import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
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
import { shareService } from "../services/shareService";
import axios from "axios";

export function EditShare() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 상태 관리
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("vegetable");
  const [expiryDate, setExpiryDate] = useState("");
  const [pickupType, setPickupType] = useState<"Free" | "Pickup">("Free");
  const [description, setDescription] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fieldClassName =
    "w-full rounded-xl border border-transparent bg-input-background px-4 py-3 focus-visible:border-[#1d7d5e] focus-visible:ring-[3px] focus-visible:ring-[#1d7d5e]/20";

  // 1. 기존 데이터 불러오기
  useEffect(() => {
    const fetchItem = async () => {
      try {
        if (!id) return;
        const res = await shareService.getById(id);
        const { post } = res;

        setItemName(post.ingredient_name);
        setCategory(post.category || "vegetable");
        setExpiryDate(post.ingredient_id?.expiration_date?.split("T")[0] || "");
        setPickupType(post.pickup_type);
        setDescription(post.description);
        setPreviewUrl(post.photo_url);
      } catch (error) {
        alert("데이터를 불러오지 못했습니다.");
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItem();
  }, [id, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!itemName.trim() || !id) return alert("게시글 이름을 입력해주세요.");

    try {
      setIsSaving(true);
      let finalImageUrl = previewUrl;

      if (imageFile) {
        const cloudinaryFormData = new FormData();
        cloudinaryFormData.append("file", imageFile);
        cloudinaryFormData.append("upload_preset", "Project"); // 본인의 프리셋 이름 확인

        const cloudName = "dwc2isol3";

        const cloudRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          cloudinaryFormData,
        );
        finalImageUrl = cloudRes.data.secure_url;
      }

      // 서버로 보낼 데이터 구성 (JSON으로 전송 시도)
      const updateData = new FormData();
      updateData.append("ingredient_name", itemName);
      updateData.append("pickup_type", pickupType);
      updateData.append("description", description);
      updateData.append("photo_url", finalImageUrl || "");

      await shareService.update(id, updateData);
      alert("수정되었습니다! ✨");
      navigate(`/share/${id}`, { replace: true });
    } catch (error) {
      console.error(error);
      alert("수정에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl">Edit Post</h1>
        </div>
      </div>

      <div className="px-6 py-6 pb-44">
        <div className="mb-6">
          <label className="flex h-48 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-primary/30 bg-secondary/30 overflow-hidden relative">
            {previewUrl ? (
              <img
                src={previewUrl}
                className="w-full h-full object-cover"
                alt="Preview"
              />
            ) : (
              <div className="flex flex-col items-center">
                <Camera className="h-8 w-8 text-[#1d7d5e]" />
                <p className="text-sm text-muted-foreground mt-2">
                  Change Photo
                </p>
              </div>
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
          <div>
            <Label className="mb-2 block text-sm">Item Name</Label>
            <Input
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className={fieldClassName}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block text-sm">Sharing Type</Label>
              <Select
                value={pickupType}
                onValueChange={(v: any) => setPickupType(v)}
              >
                <SelectTrigger className="w-full rounded-xl border-none bg-input-background px-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Free">🎁 Free</SelectItem>
                  <SelectItem value="Pickup">🤝 Pickup</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="mb-2 block text-sm">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${fieldClassName} min-h-[120px]`}
            />
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-6 z-40 px-6">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full rounded-xl bg-[#1d7d5e] py-6 text-white hover:bg-[#17664c]"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
