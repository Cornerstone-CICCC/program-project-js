"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function EditSharedItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "free", // 나눔 방식 (무료나눔: free / 직거래: pickup)
    quantity: "",
    expiryDate: "",
    imageUrl: "",
  });

  // 1. 기존 데이터 불러오기
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`/api/shared/${id}`);
        if (!res.ok) throw new Error();

        const data = await res.json();

        setFormData({
          name: data.name || "",
          description: data.description || "",
          status: data.status ? data.status.toLowerCase() : "free",
          quantity: data.quantity || "",
          expiryDate: data.expiryDate
            ? new Date(data.expiryDate).toISOString().split("T")[0]
            : "",
          imageUrl: data.imageUrl || "",
        });
        setPreviewUrl(data.imageUrl || null);
      } catch (error) {
        toast.error("Failed to load information.");
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // 2. 수정 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const updatePromise = fetch(`/api/shared/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    toast.promise(updatePromise, {
      loading: "Saving your changes...",
      success: (res) => {
        if (!res.ok) throw new Error();
        setTimeout(() => {
          router.push(`/shared/${id}`);
          router.refresh();
        }, 1000);
        return "Changes saved successfully! 🍊";
      },
      error: "Failed to save changes.",
    });

    setSubmitting(false);
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "100px", fontWeight: "700" }}>
        Loading information...
      </div>
    );

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
        <button
          onClick={() => router.back()}
          style={{
            background: "white",
            border: "1px solid #f3f4f6",
            width: "40px",
            height: "40px",
            borderRadius: "14px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            color: "#9ca3af",
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
        </button>
        <h1
          style={{
            fontSize: "26px",
            fontWeight: "900",
            margin: 0,
            letterSpacing: "-0.025em",
          }}
        >
          Edit Item 🍎
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
                  Change Photo
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
              type="text"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
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
              Expired date
            </label>
            <input
              type="date"
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
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={submitting}
          style={{
            width: "100%",
            padding: "20px",
            borderRadius: "24px",
            backgroundColor: submitting ? "#f3f4f6" : "#f97316",
            color: submitting ? "#9ca3af" : "white",
            fontWeight: "900",
            fontSize: "18px",
            border: "none",
            cursor: submitting ? "not-allowed" : "pointer",
            boxShadow: submitting
              ? "none"
              : "0 10px 20px rgba(249, 115, 22, 0.25)",
            transition: "all 0.2s ease",
          }}
        >
          {submitting ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
