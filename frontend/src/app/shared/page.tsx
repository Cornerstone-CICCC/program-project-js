"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { calculateDistance } from "@/utils/distance";

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
    const matchesFilter =
      activeFilter === "all" || item.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div
      style={{
        padding: "40px 20px 120px 20px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        color: "#333",
        backgroundColor: "#fcfcfc",
        minHeight: "100vh",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "25px",
          gap: "12px",
        }}
      >
        <Link
          href="/"
          style={{ textDecoration: "none", fontSize: "24px", color: "#333" }}
        >
          {" "}
          ←{" "}
        </Link>
        <h1 style={{ fontSize: "28px", fontWeight: "800", margin: 0 }}>
          Shared Board
        </h1>
      </div>

      {/* 검색창 */}
      <div style={{ position: "relative", marginBottom: "20px" }}>
        <span
          style={{
            position: "absolute",
            left: "15px",
            top: "13px",
            color: "#9ca3af",
          }}
        >
          🔍
        </span>
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "14px 14px 14px 45px",
            borderRadius: "16px",
            border: "1px solid #f3f4f6",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* 필터 칩 */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
        {["all", "free", "pickup"].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              padding: "10px 16px",
              borderRadius: "12px",
              backgroundColor: activeFilter === f ? "#10b981" : "white",
              color: activeFilter === f ? "white" : "#6b7280",
              border: activeFilter === f ? "none" : "1px solid #f3f4f6",
              fontWeight: "bold",
              fontSize: "13px",
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {f === "all" ? "Available" : f}
          </button>
        ))}
      </div>

      {/* 나눔 그리드 */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px", color: "#9ca3af" }}>
          Loading...
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px",
          }}
        >
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              // 거리 계산 (item.lat, item.lng 사용)
              const distanceAway =
                item.lat && item.lng
                  ? calculateDistance(
                      userLoc.lat,
                      userLoc.lng,
                      item.lat,
                      item.lng,
                    )
                  : "Location N/A";

              return (
                <Link
                  key={item.id}
                  href={`/shared/${item.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div
                    style={{
                      backgroundColor: "white",
                      padding: "15px",
                      borderRadius: "20px",
                      border: "1px solid #f3f4f6",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      transition: "transform 0.2s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "scale(1.02)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                  >
                    <div
                      style={{
                        fontSize: "40px",
                        marginBottom: "12px",
                        backgroundColor: "#f9fafb",
                        width: "100%",
                        borderRadius: "15px",
                        padding: "15px 0",
                      }}
                    >
                      {item.name?.toLowerCase().includes("apple")
                        ? "🍎"
                        : item.name?.toLowerCase().includes("milk")
                          ? "🥛"
                          : "📦"}
                    </div>
                    <div
                      style={{
                        fontWeight: "700",
                        fontSize: "15px",
                        marginBottom: "4px",
                      }}
                    >
                      {item.name}
                    </div>

                    {/* 📍 거리 표시 */}
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#10b981",
                        fontWeight: "600",
                        marginBottom: "8px",
                      }}
                    >
                      📍 {distanceAway} away
                    </div>

                    <div
                      style={{
                        display: "inline-block",
                        fontSize: "10px",
                        fontWeight: "800",
                        padding: "3px 8px",
                        borderRadius: "8px",
                        backgroundColor:
                          item.status === "free" ? "#dcfce7" : "#dbeafe",
                        color: item.status === "free" ? "#059669" : "#2563eb",
                        textTransform: "uppercase",
                        marginBottom: "12px",
                      }}
                    >
                      {item.status}
                    </div>

                    <div
                      style={{
                        width: "100%",
                        borderTop: "1px solid #f9fafb",
                        paddingTop: "10px",
                        marginTop: "auto",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <div
                        style={{
                          width: "14px",
                          height: "14px",
                          borderRadius: "50%",
                          backgroundColor: "#e5e7eb",
                        }}
                      ></div>
                      {/* ⬇️ 이 부분을 아래와 같이 수정하세요 */}
                      <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                        {item.owner
                          ? `${item.owner.firstName} ${item.owner.lastName}`
                          : "Unknown"}
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
                padding: "60px 0",
                color: "#9ca3af",
              }}
            >
              No items found.
            </div>
          )}
        </div>
      )}

      {/* 플로팅 버튼 */}
      <Link
        href="/shared/add"
        style={{
          position: "fixed",
          bottom: "100px",
          right: "25px",
          width: "60px",
          height: "60px",
          borderRadius: "30px",
          backgroundColor: "#10b981",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          fontSize: "30px",
          textDecoration: "none",
          boxShadow: "0 10px 20px rgba(16, 185, 129, 0.3)",
          zIndex: 1000,
        }}
      >
        {" "}
        +{" "}
      </Link>

      {/* 네비게이션 */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "85px",
          backgroundColor: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
          borderTop: "1px solid #f3f4f6",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          paddingBottom: "15px",
          zIndex: 100,
        }}
      >
        <Link
          href="/"
          style={{ textDecoration: "none", color: "inherit", opacity: 0.4 }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "20px" }}>🏠</div>
            <div style={{ fontSize: "10px" }}>Home</div>
          </div>
        </Link>
        <div style={{ textAlign: "center", opacity: 0.4 }}>
          <div style={{ fontSize: "20px" }}>🍳</div>
          <div style={{ fontSize: "10px" }}>Recipe</div>
        </div>
        <div style={{ textAlign: "center", color: "#10b981" }}>
          <div style={{ fontSize: "20px" }}>🤝</div>
          <div style={{ fontSize: "10px", fontWeight: "800" }}>Share</div>
        </div>
        <div style={{ textAlign: "center", opacity: 0.4 }}>
          <div style={{ fontSize: "20px" }}>💬</div>
          <div style={{ fontSize: "10px" }}>Chat</div>
        </div>
        <div style={{ textAlign: "center", opacity: 0.4 }}>
          <div style={{ fontSize: "20px" }}>👤</div>
          <div style={{ fontSize: "10px" }}>My Page</div>
        </div>
      </nav>
    </div>
  );
}
