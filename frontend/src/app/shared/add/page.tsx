"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function AddSharedItemPage() {
  const router = useRouter(); // 👈 여기서 한 번만 선언!
  const { data: session } = useSession();

  // 1. 모든 입력값을 하나의 formData로 통합 (중복 선언 삭제)
  const [formData, setFormData] = useState({
    name: "",
    status: "free",
    quantity: "",
    expiryDate: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // 📸 이미지 관련 상태
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // ✨ AI 추천 기능 (Gemini API 호출)
  const handleAISuggest = async () => {
    if (!formData.name) {
      return alert("Please enter Item Name first!");
    }

    setAiLoading(true);
    try {
      const response = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemName: formData.name }),
      });
      const data = await response.json();

      if (data.suggestion) {
        // AI가 추천해준 내용을 description 칸에 자동 주입
        setFormData((prev) => ({ ...prev, description: data.suggestion }));
      }
    } catch (error) {
      console.error("AI Error:", error);
      alert("AI recommendation failed.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImageToCloudinary = async () => {
    if (!imageFile) return null;
    const cloudName = "dwc2isol3";
    const uploadPreset = "ml_default";
    const uploadData = new FormData();
    uploadData.append("file", imageFile);
    uploadData.append("upload_preset", uploadPreset);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: uploadData,
        },
      );
      const data = await res.json();
      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary Error:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return alert("Login is required!");
    if (!formData.name || !formData.expiryDate)
      return alert("Fill in Name and Expiry Date!");

    setLoading(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          let uploadedImageUrl = "";
          if (imageFile) {
            uploadedImageUrl = await uploadImageToCloudinary();
          }

          const res = await fetch("/api/shared", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: formData.name,
              description: formData.description,
              status: formData.status,
              quantity: Number(formData.quantity) || 1,
              expiryDate: formData.expiryDate,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              imageUrl: uploadedImageUrl,
              category: "Food",
              // ✅ Prisma 모델의 User 관계는 서버 세션에서 처리합니다.
            }),
          });

          if (res.ok) {
            alert("Item registered successfully! 🍎");
            router.push("/shared");
          }
        } catch (error) {
          alert("An error occurred while saving.");
        } finally {
          setLoading(false);
        }
      });
    }
  };

  return (
    <div
      style={{
        padding: "40px 20px",
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "white",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "30px",
          gap: "12px",
        }}
      >
        <Link
          href="/shared"
          style={{ textDecoration: "none", fontSize: "24px", color: "#333" }}
        >
          ←
        </Link>
        <h1 style={{ fontSize: "24px", fontWeight: "800", margin: 0 }}>
          Add Item
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* 이미지 업로드 */}
        <div style={{ marginBottom: "25px" }}>
          <label
            htmlFor="image-upload"
            style={{
              width: "100%",
              height: "200px",
              backgroundColor: "#f9fafb",
              borderRadius: "20px",
              border: "2px dashed #e5e7eb",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              overflow: "hidden",
            }}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span>📸 Add Photo</span>
            )}
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
        </div>

        {/* 아이템 이름 */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "700",
              marginBottom: "8px",
            }}
          >
            Item Name
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border: "1px solid #f3f4f6",
              backgroundColor: "#f9fafb",
            }}
          />
        </div>

        {/* 수량 및 날짜 */}
        <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "700",
                marginBottom: "8px",
              }}
            >
              Quantity
            </label>
            <input
              type="text"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "1px solid #f3f4f6",
                backgroundColor: "#f9fafb",
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "700",
                marginBottom: "8px",
              }}
            >
              Expiry Date
            </label>
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) =>
                setFormData({ ...formData, expiryDate: e.target.value })
              }
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "1px solid #f3f4f6",
                backgroundColor: "#f9fafb",
              }}
            />
          </div>
        </div>

        {/* 상세 설명 (AI 버튼 포함) */}
        <div style={{ marginBottom: "40px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}
          >
            <label style={{ fontSize: "14px", fontWeight: "700" }}>
              Description
            </label>
            <button
              type="button"
              onClick={handleAISuggest}
              disabled={aiLoading}
              style={{
                fontSize: "12px",
                color: "#10b981",
                border: "none",
                background: "none",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {aiLoading ? "✨ Thinking..." : "✨ AI Suggestion"}
            </button>
          </div>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border: "1px solid #f3f4f6",
              backgroundColor: "#f9fafb",
              resize: "none",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "18px",
            borderRadius: "16px",
            backgroundColor: loading ? "#ccc" : "#10b981",
            color: "white",
            fontWeight: "800",
            border: "none",
          }}
        >
          {loading ? "Posting..." : "Post Item"}
        </button>
      </form>
    </div>
  );
}
