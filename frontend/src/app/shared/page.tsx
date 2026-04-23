"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { calculateDistance } from "@/utils/distance";
import { cn } from "@/lib/utils";

export default function SharedBoardPage() {
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // 1. 사용자 위치 상태 (기본값: Vancouver)
  const [userLoc, setUserLoc] = useState({ lat: 49.2827, lng: -123.1207 });

  useEffect(() => {
    // 2. 사용자 위치 파악
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLoc({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => console.log("Location access denied", err),
      );
    }

    // 3. 데이터 가져오기 (에러 방지 로직 포함)
    const fetchItems = async () => {
      try {
        const res = await fetch("/api/shared");

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const text = await res.text();
        if (!text) {
          setItems([]);
          return;
        }

        const data = JSON.parse(text);
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch items:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // 4. 검색 및 필터링 로직
  const filteredItems = items.filter((item) => {
    const itemName = item.name || "";
    const matchesSearch = itemName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // ✅ 해결책: 데이터의 status와 비교할 때 대소문자 무시(toLowerCase) 처리를 넣어보세요.
    const matchesFilter =
      activeFilter === "all" ||
      (item.status && item.status.toLowerCase() === activeFilter.toLowerCase());

    return matchesSearch && matchesFilter;
  });

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
      {/* 헤더: 더 볼드하고 세련된 스타일 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "30px",
          gap: "16px",
        }}
      >
        <Link
          href="/"
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
          Shared Board 🥦
        </h1>
      </div>

      {/* 검색창: 둥글고 그림자 있는 스타일 */}
      <div style={{ position: "relative", marginBottom: "25px" }}>
        <span
          style={{
            position: "absolute",
            left: "18px",
            top: "16px",
            color: "#d1d5db",
            fontSize: "18px",
          }}
        >
          🔍
        </span>
        <input
          type="text"
          placeholder="Search for ingredients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "16px 16px 16px 52px",
            borderRadius: "22px",
            border: "2px solid #f3f4f6",
            backgroundColor: "white",
            outline: "none",
            boxSizing: "border-box",
            fontSize: "15px",
            fontWeight: "600",
            transition: "all 0.2s ease",
          }}
        />
      </div>

      {/* 필터 칩: 둥근 알약 스타일 */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "32px",
          overflowX: "auto",
          paddingBottom: "5px",
        }}
      >
        {["all", "free", "in-person"].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              padding: "12px 20px",
              borderRadius: "16px",
              backgroundColor: activeFilter === f ? "#2563eb" : "white",
              color: activeFilter === f ? "white" : "#2563eb",
              border: "none",
              boxShadow:
                activeFilter === f
                  ? "0 8px 16px rgba(249, 115, 22, 0.2)"
                  : "0 2px 4px rgba(0,0,0,0.02)",
              fontWeight: "800",
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap",
            }}
          >
            {f === "all" ? "All Posts" : f === "free" ? "Free" : "In-Person"}
          </button>
        ))}
      </div>

      {/* 나눔 그리드: 카드 기반 디자인 */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              border: "4px solid #f97316",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const distanceAway =
                item.lat && item.lng
                  ? calculateDistance(
                      userLoc.lat,
                      userLoc.lng,
                      item.lat,
                      item.lng,
                    )
                  : "Location not available";

              return (
                <Link
                  key={item.id}
                  href={`/shared/${item.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div
                    style={{
                      backgroundColor: "white",
                      padding: "20px",
                      borderRadius: "32px",
                      border: "1px solid #f3f4f6",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-5px)";
                      e.currentTarget.style.boxShadow =
                        "0 12px 24px rgba(0,0,0,0.04)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* 아이콘 배경 */}
                    <div
                      style={{
                        width: "60px",
                        height: "60px",
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        borderRadius: "16px",
                        backgroundColor: "#f9fafb",
                        margin: "0 auto",
                      }}
                    >
                      {/* ✅ DB에 저장된 imageUrl이 있는지 확인 */}
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover", // 비율에 맞춰 꽉 채움
                          }}
                        />
                      ) : (
                        /* ✅ 이미지가 없을 때만 기존 이모지 로직 작동 */
                        <span style={{ fontSize: "30px" }}>📸</span>
                      )}
                    </div>

                    {/* 아이템 이름 */}
                    <div
                      style={{
                        fontWeight: "800",
                        fontSize: "16px",
                        marginBottom: "6px",
                        color: "#1f2937",
                        width: "100%",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.name}
                    </div>

                    {/* 📍 거리 표시 - 포인트 컬러 강조 */}
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#f97316",
                        fontWeight: "800",
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "3px",
                      }}
                    >
                      <span style={{ fontSize: "14px" }}>📍</span>{" "}
                      {distanceAway}
                    </div>

                    {/* 상태 라벨 */}
                    <div
                      style={{
                        display: "inline-block",
                        fontSize: "10px",
                        fontWeight: "900",
                        padding: "5px 12px",
                        borderRadius: "10px",
                        backgroundColor:
                          item.status === "free" ? "#ecfdf5" : "#eff6ff",
                        color: item.status === "free" ? "#059669" : "#2563eb",
                        textTransform: "uppercase",
                        marginBottom: "16px",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {item.status}
                    </div>

                    {/* 작성자 정보 영역 */}
                    <div
                      style={{
                        width: "100%",
                        borderTop: "1px solid #f9fafb",
                        paddingTop: "12px",
                        marginTop: "auto",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          backgroundColor: "#f3f4f6",
                          fontSize: "10px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        👤
                      </div>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#9ca3af",
                          fontWeight: "700",
                        }}
                      >
                        {item.owner
                          ? `${item.owner.firstName}${item.owner.lastName}`
                          : "neighbor"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div
              style={{
                gridColumn: "span 2",
                textAlign: "center",
                padding: "100px 0",
                color: "#d1d5db",
              }}
            >
              <div style={{ fontSize: "50px", marginBottom: "20px" }}>🏜️</div>
              <p style={{ fontWeight: "800", color: "#9ca3af" }}>
                No results found.
              </p>
            </div>
          )}
        </div>
      )}

      <Link
        href="/shared/add"
        style={{
          position: "fixed",
          bottom: "100px",
          right: "30px",
          width: "66px",
          height: "66px",
          borderRadius: "24px",
          backgroundColor: "#2563eb",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          fontSize: "32px",
          textDecoration: "none",
          zIndex: 1000,
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </Link>
    </div>
  );
}
