"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddSharedItemPage() {
  const router = useRouter();

  // 1. 모든 입력값을 formData 하나로 관리
  const [formData, setFormData] = useState({
    name: "",
    status: "free",
    quantity: "",
    expiryDate: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  // 📸 추가: 이미지 파일과 미리보기 URL을 위한 상태
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // 📸 추가: 파일 선택 시 호출되는 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // 브라우저 메모리에 임시 미리보기 생성
    }
  };

  // 📸 추가: Cloudinary 업로드 함수
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
      return data.secure_url; // 업로드된 이미지의 최종 URL 반환
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.expiryDate) {
      return alert("Please enter Item Name and Expiry Date!");
    }

    setLoading(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            // 📸 추가: 폼 전송 전 이미지를 먼저 업로드합니다.
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
                quantity: formData.quantity ? Number(formData.quantity) : 1,
                expiryDate: formData.expiryDate,
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                userId: "69d6af373b29c68390dd5a0e",
                category: "Food",
                imageUrl: uploadedImageUrl, // 📸 추가: 이미지 URL을 서버로 보냄
              }),
            });

            if (res.ok) {
              alert("Item registered successfully! 🍎");
              router.push("/shared");
            } else {
              const errorData = await res.json();
              alert(`Failed: ${errorData.error || "Unknown error"}`);
            }
          } catch (error) {
            console.error("Error saving item:", error);
            alert("An error occurred while saving.");
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          setLoading(false);
          alert("Location access is required to share items.");
        },
        { timeout: 10000 },
      );
    } else {
      setLoading(false);
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div
      style={{
        padding: "40px 20px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
        {/* 📸 수정: 이미지 업로드 영역 */}
        <div style={{ marginBottom: "25px" }}>
          <label
            htmlFor="image-upload"
            style={{
              width: "100%",
              height: "200px", // 높이를 조금 더 키웠습니다
              backgroundColor: "#f9fafb",
              borderRadius: "20px",
              border: "2px dashed #e5e7eb",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              overflow: "hidden", // 이미지가 둥근 테두리 밖으로 나가지 않게 함
              position: "relative", // 내부 요소 배치를 위해 추가
            }}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  width: "100%", // 가로를 꽉 채움
                  height: "100%", // 세로를 꽉 채움
                  objectFit: "cover", // 👈 핵심: 비율을 유지하며 칸을 꽉 채움 (잘리는 부분 발생)
                  display: "block",
                }}
              />
            ) : (
              <>
                <span style={{ fontSize: "30px" }}>📸</span>
                <span
                  style={{
                    fontSize: "14px",
                    color: "#9ca3af",
                    marginTop: "8px",
                  }}
                >
                  Add Photo
                </span>
              </>
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

        {/* Item Name */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "700",
              marginBottom: "8px",
              color: "#4b5563",
            }}
          >
            Item Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Organic Apples"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border: "1px solid #f3f4f6",
              backgroundColor: "#f9fafb",
              outline: "none",
            }}
          />
        </div>

        {/* Status */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "700",
              marginBottom: "8px",
              color: "#4b5563",
            }}
          >
            Status
          </label>
          <div style={{ display: "flex", gap: "10px" }}>
            {["free", "pickup"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFormData({ ...formData, status: s })}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  border:
                    formData.status === s
                      ? "2px solid #10b981"
                      : "1px solid #f3f4f6",
                  backgroundColor: formData.status === s ? "#f0fdf4" : "white",
                  color: formData.status === s ? "#10b981" : "#9ca3af",
                  textTransform: "capitalize",
                  transition: "0.2s",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity & Expiry Date */}
        <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "700",
                marginBottom: "8px",
                color: "#4b5563",
              }}
            >
              Quantity
            </label>
            <input
              type="text"
              placeholder="e.g. 5"
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
                outline: "none",
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
                color: "#4b5563",
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
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: "40px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "700",
              marginBottom: "8px",
              color: "#4b5563",
            }}
          >
            Description
          </label>
          <textarea
            rows={4}
            placeholder="Share details about pickup location..."
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
              outline: "none",
              resize: "none",
            }}
          />
        </div>

        {/* 등록 버튼 */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "18px",
            borderRadius: "16px",
            backgroundColor: loading ? "#ccc" : "#10b981",
            color: "white",
            fontSize: "16px",
            fontWeight: "800",
            border: "none",
            cursor: loading ? "default" : "pointer",
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
            transition: "0.2s",
          }}
        >
          {loading ? "Posting with Image..." : "Post Item"}
        </button>
      </form>
    </div>
  );
}
