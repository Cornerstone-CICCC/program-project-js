"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { calculateDistance } from "@/utils/distance";

export default function SharedDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  // 1. Next.js 15+ 규격: params Promise를 use()로 언래핑
  const resolvedParams = use(params);
  const itemId = resolvedParams.id;

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userLoc, setUserLoc] = useState({ lat: 49.2827, lng: -123.1207 });

  useEffect(() => {
    const fetchItem = async () => {
      try {
        // 내 위치 정보 가져오기
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition((pos) => {
            setUserLoc({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
          });
        }

        // 2. API 데이터 가져오기
        const res = await fetch(`/api/shared`);

        // 에러 핸들링 추가: 응답이 OK가 아니면 텍스트로 읽어보거나 에러 발생
        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();

        // 3. 데이터가 배열인지 확인 후 아이템 찾기
        if (Array.isArray(data)) {
          const foundItem = data.find(
            (i: any) => String(i.id) === String(itemId),
          );
          if (foundItem) {
            setItem(foundItem);
          }
        }
      } catch (error) {
        console.error("Failed to fetch item:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId]);

  if (loading)
    return (
      <div style={{ padding: "100px", textAlign: "center", color: "#9ca3af" }}>
        Loading...
      </div>
    );

  if (!item)
    return (
      <div style={{ padding: "100px", textAlign: "center" }}>
        <p style={{ marginBottom: "20px" }}>Item not found.</p>
        <Link href="/shared" style={{ color: "#10b981", fontWeight: "bold" }}>
          Go back to list
        </Link>
      </div>
    );

  // 4. 데이터 표시를 위한 변수 정리 (Prisma CamelCase 대응)
  const formattedExpiry = item.expiryDate
    ? new Date(item.expiryDate).toLocaleDateString()
    : "No Date Set";

  const distanceAway =
    item.lat && item.lng
      ? calculateDistance(userLoc.lat, userLoc.lng, item.lat, item.lng)
      : "Location N/A";

  return (
    <div
      style={{
        padding: "20px 20px 100px 20px",
        maxWidth: "600px",
        margin: "0 auto",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        backgroundColor: "white",
        minHeight: "100vh",
      }}
    >
      {/* 상단 네비게이션 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
          }}
        >
          ←
        </button>
        <button
          style={{
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
          }}
        >
          ⋮
        </button>
      </div>

      {/* 아이템 이미지/이모지 영역 */}
      <div
        style={{
          width: "100%",
          height: "300px",
          borderRadius: "24px",
          overflow: "hidden",
        }}
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={
              {
                /* 기존 이모지 스타일 */
              }
            }
          >
            {item.name?.toLowerCase().includes("apple") ? "🍎" : "📦"}
          </div>
        )}
      </div>

      {/* 아이템 기본 정보 */}
      <div style={{ marginBottom: "25px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <h1 style={{ fontSize: "26px", fontWeight: "800", margin: 0 }}>
            {item.name}
          </h1>
          <div
            style={{
              backgroundColor: item.status === "free" ? "#dcfce7" : "#dbeafe",
              color: item.status === "free" ? "#059669" : "#2563eb",
              padding: "6px 12px",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: "800",
              textTransform: "uppercase",
            }}
          >
            {item.status}
          </div>
        </div>

        {/* 📍 거리 및 날짜 표시 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            color: "#6b7280",
            marginTop: "10px",
            fontSize: "14px",
          }}
        >
          <span>📍</span>
          <span style={{ fontWeight: "600", color: "#10b981" }}>
            {distanceAway} away
          </span>
          <span style={{ color: "#e5e7eb" }}>|</span>
          <span>Expiry: {formattedExpiry}</span>
        </div>
      </div>

      {/* 작성자 프로필 카드 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "15px",
          borderRadius: "16px",
          backgroundColor: "#f9fafb",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            width: "45px",
            height: "45px",
            borderRadius: "22.5px",
            backgroundColor: "#e5e7eb",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "20px",
          }}
        >
          👤
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "15px", fontWeight: "700" }}>
            {item.owner?.name || "Anonymous User"}
          </div>
          <div style={{ fontSize: "12px", color: "#9ca3af" }}>
            ⭐ 5.0 · Vancouver, BC
          </div>
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "#10b981",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          View Profile
        </div>
      </div>

      {/* 상세 설명 */}
      <div style={{ marginBottom: "40px" }}>
        <h3
          style={{ fontSize: "18px", fontWeight: "700", marginBottom: "10px" }}
        >
          Description
        </h3>
        <p style={{ color: "#4b5563", lineHeight: "1.6", margin: 0 }}>
          {item.description || "No description provided."}
        </p>
      </div>

      {/* 하단 버튼 */}
      <div
        style={{
          position: "fixed",
          bottom: "30px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "calc(100% - 40px)",
          maxWidth: "560px",
        }}
      >
        <button
          style={{
            width: "100%",
            padding: "20px",
            borderRadius: "20px",
            backgroundColor: "#10b981",
            color: "white",
            fontSize: "18px",
            fontWeight: "800",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 10px 20px rgba(16, 185, 129, 0.2)",
          }}
        >
          Send Message
        </button>
      </div>
    </div>
  );
}
