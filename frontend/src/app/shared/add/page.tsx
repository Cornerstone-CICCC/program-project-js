"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

export default function AddSharedItemPage() {
  const router = useRouter(); // 👈 여기서 한 번만 선언!
  const { data: session } = useSession();
  const today = new Date().toISOString().split("T")[0];

  // 1. 모든 입력값을 하나의 formData로 통합 (중복 선언 삭제)
  const [formData, setFormData] = useState({
    name: "",
    status: "free",
    quantity: "",
    expiryDate: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  // 📸 이미지 관련 상태
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

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

    // 1. 기본 유효성 검사
    if (!session) {
      toast.error("Authentication required. Please login first!");
      return;
    }

    if (!formData.name || !formData.expiryDate) {
      toast.error("Please fill in all required fields!");
      return;
    }

    // 2. 위치 권한 및 정보 가져오기 (강제화)
    if (!("geolocation" in navigator)) {
      toast.error("Location services are not supported by your browser.");
      return;
    }

    setLoading(true);

    // Promise를 통해 위치 정보를 기다림
    const getPosition = () => {
      return new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true, // 더 정확한 위치 요청
          timeout: 10000, // 10초 대기
        });
      });
    };

    try {
      const position = await getPosition();
      const { latitude, longitude } = position.coords;

      // 3. 이미지 업로드 (위치 확인 후 진행하여 리소스 낭비 방지)
      let uploadedImageUrl = "";
      if (imageFile) {
        uploadedImageUrl = await uploadImageToCloudinary();
      }

      // 4. 최종 서버 전송
      const res = await fetch("/api/shared", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          quantity: Number(formData.quantity) || 1,
          expiryDate: new Date(formData.expiryDate).toISOString(),
          lat: latitude,
          lng: longitude,
          imageUrl: uploadedImageUrl,
          category: "Food",
        }),
      });

      if (res.ok) {
        // ✅ 성공 알림
        toast.success("Your giveaway has started with nearby neighbors! 🍎", {
          duration: 3000, // 3초 동안 표시
        });
        router.push("/shared");
      } else {
        throw new Error("Failed to register on the server");
      }
    } catch (error: any) {
      console.error("Error:", error);

      // ✅ 에러 상세 처리 (Toast로 변경)
      if (error.code === 1) {
        // PERMISSION_DENIED
        toast.error("📍 Location permission is required to find neighbors.");
      } else if (error.code === 3) {
        // TIMEOUT
        toast.error("Location request timed out. Please try again.");
      } else if (error.message === "Failed to register on the server") {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error("An unexpected error occurred while posting.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "40px 24px 120px 24px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        color: "#1f2937",
        backgroundColor: "#fcfcfc",
        minHeight: "100vh",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "32px",
          gap: "16px",
        }}
      >
        <Link
          href="/shared"
          style={{
            textDecoration: "none",
            fontSize: "20px",
            color: "#9ca3af",
            backgroundColor: "white",
            width: "40px",
            height: "40px",
            borderRadius: "14px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "1px solid #f3f4f6",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1
          style={{
            fontSize: "26px",
            fontWeight: "900",
            margin: 0,
            letterSpacing: "-0.025em",
          }}
        >
          Add Item 🍎
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* 이미지 업로드 */}
        <div style={{ marginBottom: "30px" }}>
          <label
            htmlFor="image-upload"
            style={{
              width: "100%",
              height: "240px",
              backgroundColor: "white",
              borderRadius: "32px",
              border: "2px dashed #e5e7eb",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              overflow: "hidden",
              transition: "all 0.2s ease",
              gap: "12px",
            }}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <>
                <div style={{ fontSize: "40px" }}>📸</div>
                <span
                  style={{
                    fontWeight: "800",
                    color: "#9ca3af",
                    fontSize: "15px",
                  }}
                >
                  Add Pictures
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

        {/* 나눔 방식 선택 (무료나눔 / 직거래) */}
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "800",
              marginBottom: "12px",
              color: "#4b5563",
              marginLeft: "4px",
            }}
          >
            Sharing Method
          </label>
          <div style={{ display: "flex", gap: "12px" }}>
            {[
              { id: "free", label: "Free Share", emoji: "🎁" },
              { id: "in-person", label: "In-person", emoji: "🤝" },
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setFormData({ ...formData, status: type.id })}
                style={{
                  flex: 1,
                  padding: "16px",
                  borderRadius: "20px",
                  border: "2px solid",
                  borderColor:
                    formData.status === type.id ? "#2563eb" : "#f3f4f6",
                  backgroundColor:
                    formData.status === type.id ? "#2563eb" : "white",
                  color: formData.status === type.id ? "white" : "#2563eb",
                  fontWeight: "800",
                  fontSize: "15px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <span>{type.emoji}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* 아이템 이름 */}
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "800",
              marginBottom: "10px",
              color: "#4b5563",
              marginLeft: "4px",
            }}
          >
            Item Name
          </label>
          <input
            type="text"
            required
            placeholder="What would you like to share?"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{
              width: "100%",
              padding: "18px 20px",
              borderRadius: "20px",
              border: "2px solid #f3f4f6",
              backgroundColor: "white",
              fontSize: "16px",
              fontWeight: "600",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* 수량 및 날짜 */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "800",
                marginBottom: "10px",
                color: "#4b5563",
                marginLeft: "4px",
              }}
            >
              Quantity
            </label>
            <input
              type="number"
              pattern="\d*"
              required
              placeholder="0"
              value={formData.quantity}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                setFormData({ ...formData, quantity: e.target.value });
              }}
              style={{
                width: "100%",
                padding: "18px 20px",
                borderRadius: "20px",
                border: "2px solid #f3f4f6",
                backgroundColor: "white",
                fontSize: "16px",
                fontWeight: "600",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "800",
                marginBottom: "10px",
                color: "#4b5563",
                marginLeft: "4px",
              }}
            >
              Expiry date
            </label>
            <input
              type="date"
              required
              min={today}
              value={formData.expiryDate}
              onChange={(e) =>
                setFormData({ ...formData, expiryDate: e.target.value })
              }
              style={{
                width: "100%",
                padding: "18px 20px",
                borderRadius: "20px",
                border: "2px solid #f3f4f6",
                backgroundColor: "white",
                fontSize: "16px",
                fontWeight: "600",
                outline: "none",
                boxSizing: "border-box",
                cursor: "pointer",
              }}
            />
          </div>
        </div>

        {/* 상세 설명 */}
        <div style={{ marginBottom: "40px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "800",
              marginBottom: "10px",
              color: "#4b5563",
              marginLeft: "4px",
            }}
          >
            Description
          </label>
          <textarea
            rows={5}
            placeholder="Please include storage tips or meeting locations."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            style={{
              width: "100%",
              padding: "20px",
              borderRadius: "24px",
              border: "2px solid #f3f4f6",
              backgroundColor: "white",
              fontSize: "16px",
              fontWeight: "600",
              outline: "none",
              boxSizing: "border-box",
              resize: "none",
              lineHeight: "1.5",
            }}
          />
          <p
            style={{
              fontSize: "12px",
              color: "#9ca3af",
              marginTop: "12px",
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            📍 Your current location will be shared with neighbors upon posting.
          </p>
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "20px",
            borderRadius: "24px",
            backgroundColor: loading ? "#f3f4f6" : "#2563eb",
            color: loading ? "#9ca3af" : "white",
            fontWeight: "900",
            fontSize: "18px",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Posting..." : "Post Item"}
        </button>
      </form>
    </div>
  );
}
