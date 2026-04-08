"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddSharedItemPage() {
  const router = useRouter();

  // 1. 모든 입력값을 formData 하나로 관리
  const [formData, setFormData] = useState({
    name: "",
    status: "free", // ERD: status (free, pickup)
    quantity: "",
    expiryDate: "", // ERD: expiry_date
    description: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. 필수값 검증
    if (!formData.name || !formData.expiryDate) {
      return alert("Please enter Item Name and Expiry Date!");
    }

    setLoading(true);

    // 2. 위치 정보와 함께 데이터 전송
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch("/api/shared", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: formData.name,
                description: formData.description,
                status: formData.status,
                // ✅ 숫자로 변환하여 전송 (서버에서 Number() 처리를 하지만 여기서도 맞춰줌)
                quantity: formData.quantity ? Number(formData.quantity) : 1,
                expiryDate: formData.expiryDate,
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                // ✅ 드디어 찾은 진짜 MongoDB ID 적용!
                userId: "69d6af373b29c68390dd5a0e",
                category: "Food", // 필수값이므로 포함
              }),
            });

            if (res.ok) {
              alert("Item registered successfully! 🍎");
              router.push("/shared"); // 등록 성공 시 목록 페이지로 이동
            } else {
              const errorData = await res.json();
              console.error("Server error details:", errorData);
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
          console.error("Geolocation error:", error);
        },
        { timeout: 10000 }, // 위치 정보 획득 타임아웃 설정 (선택사항)
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
      {/* 상단 헤더 */}
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
        {/* 이미지 업로드 영역 (UI 유지) */}
        <div
          style={{
            width: "100%",
            height: "180px",
            backgroundColor: "#f9fafb",
            borderRadius: "20px",
            border: "2px dashed #e5e7eb",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "25px",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: "30px" }}>📸</span>
          <span
            style={{ fontSize: "14px", color: "#9ca3af", marginTop: "8px" }}
          >
            Add Photo
          </span>
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

        {/* Status (Free / Pickup) */}
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
              placeholder="e.g. 5 units"
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
          {loading ? "Posting..." : "Post Item"}
        </button>
      </form>
    </div>
  );
}
