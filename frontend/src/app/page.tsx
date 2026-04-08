"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function HomePage() {
  const [sharedItems, setSharedItems] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const fetchData = async () => {
      try {
        // 1. 냉장고 재료 가져오기
        const ingRes = await fetch("/api/ingredients");
        if (ingRes.ok) {
          const ingText = await ingRes.text();
          if (ingText) setIngredients(JSON.parse(ingText));
        }

        // 2. 나눔 보드 아이템 가져오기 (SyntaxError 방지 로직)
        const sharedRes = await fetch("/api/shared");
        if (sharedRes.ok) {
          const sharedText = await sharedRes.text();
          if (sharedText) {
            const sharedData = JSON.parse(sharedText);
            setSharedItems(Array.isArray(sharedData) ? sharedData : []);
          }
        }
      } catch (error) {
        console.error("데이터 로드 중 에러 발생:", error);
      }
    };

    fetchData();
  }, []);

  // AI 레시피 추천 로직
  const getRecipe = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recommend");
      if (!res.ok) throw new Error("Failed to fetch recipe");

      const text = await res.text();
      if (text) {
        setRecipe(JSON.parse(text));
      }
    } catch (error) {
      console.error("레시피를 가져오는데 실패했습니다.", error);
      alert("레시피 추천 기능에 일시적인 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "40px 20px 100px 20px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        color: "#333",
        backgroundColor: "#fcfcfc",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          fontSize: "28px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontWeight: "800",
        }}
      >
        <span>🧊</span> 내 냉장고
      </h1>

      {/* 액션 버튼 */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
        <Link
          href="/add"
          style={{
            padding: "12px 20px",
            backgroundColor: "#3b82f6",
            color: "white",
            borderRadius: "12px",
            textDecoration: "none",
            fontWeight: "bold",
            boxShadow: "0 2px 4px rgba(59, 130, 246, 0.2)",
            fontSize: "14px",
          }}
        >
          {" "}
          + 재료 추가{" "}
        </Link>
        <button
          onClick={getRecipe}
          disabled={loading}
          style={{
            padding: "12px 20px",
            backgroundColor: loading ? "#ccc" : "#9333ea",
            color: "white",
            borderRadius: "12px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 2px 4px rgba(147, 51, 234, 0.2)",
            fontSize: "14px",
          }}
        >
          {loading ? "AI 분석 중..." : "🪄 AI 레시피"}
        </button>
      </div>

      {/* AI 레시피 영역 */}
      {recipe && (
        <div
          style={{
            backgroundColor: "#fffbeb",
            padding: "20px",
            borderRadius: "20px",
            border: "2px solid #fef3c7",
            marginBottom: "30px",
          }}
        >
          <h2 style={{ color: "#92400e", fontSize: "18px", marginTop: 0 }}>
            🍳 {recipe.title}
          </h2>
          <ol
            style={{ fontSize: "14px", paddingLeft: "20px", color: "#4b5563" }}
          >
            {recipe.steps?.map((s: string, i: number) => (
              <li key={i} style={{ marginBottom: "5px" }}>
                {s}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* 1. 냉장고 재료 목록 */}
      <section style={{ marginBottom: "40px" }}>
        <h3
          style={{
            fontSize: "18px",
            fontWeight: "700",
            marginBottom: "15px",
            color: "#6b7280",
          }}
        >
          My Fridge ({ingredients.length})
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {isClient &&
            ingredients.map((item: any) => {
              const diffDays = Math.ceil(
                (new Date(item.expiryDate).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24),
              );
              const isUrgent = diffDays <= 3 && diffDays >= 0;
              const isExpired = diffDays < 0;

              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "15px",
                    backgroundColor: "white",
                    borderRadius: "16px",
                    border: isUrgent
                      ? "2px solid #fef3c7"
                      : isExpired
                        ? "2px solid #fee2e2"
                        : "1px solid #f3f4f6",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span style={{ fontSize: "24px" }}>
                      {item.emoji || "🥬"}
                    </span>
                    <div>
                      <div style={{ fontWeight: "700", fontSize: "15px" }}>
                        {item.name}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: isExpired
                            ? "#ef4444"
                            : isUrgent
                              ? "#d97706"
                              : "#3b82f6",
                          fontWeight: "600",
                        }}
                      >
                        Exp: {new Date(item.expiryDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {isUrgent && (
                    <span
                      style={{
                        fontSize: "10px",
                        backgroundColor: "#fffbeb",
                        color: "#d97706",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        fontWeight: "800",
                      }}
                    >
                      URGENT
                    </span>
                  )}
                </div>
              );
            })}
        </div>
      </section>

      {/* 2. Shared Board 섹션 */}
      <section style={{ marginBottom: "40px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#6b7280" }}>
            Shared Board
          </h3>
          <Link
            href="/shared"
            style={{
              textDecoration: "none",
              fontSize: "13px",
              color: "#10b981",
              fontWeight: "600",
            }}
          >
            View All
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px",
          }}
        >
          {sharedItems.length > 0 ? (
            sharedItems.map((item: any) => (
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
                    boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
                  }}
                >
                  <div style={{ fontSize: "32px", marginBottom: "10px" }}>
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
                      marginBottom: "5px",
                    }}
                  >
                    {item.name}
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      backgroundColor:
                        item.status === "free" ? "#dcfce7" : "#dbeafe",
                      color: item.status === "free" ? "#059669" : "#2563eb",
                      fontSize: "10px",
                      fontWeight: "800",
                      padding: "2px 8px",
                      borderRadius: "8px",
                      textTransform: "uppercase",
                    }}
                  >
                    {item.status}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div
              style={{
                gridColumn: "span 2",
                padding: "30px",
                textAlign: "center",
                color: "#9ca3af",
                border: "1px dashed #e5e7eb",
                borderRadius: "20px",
              }}
            >
              등록된 나눔 아이템이 없습니다.
            </div>
          )}
        </div>
      </section>

      {/* 하단 네비게이션 */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "80px",
          backgroundColor: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
          borderTop: "1px solid #f3f4f6",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          paddingBottom: "10px",
          zIndex: 100,
        }}
      >
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
          <NavItem icon="🏠" label="Home" active />
        </Link>
        <NavItem icon="🍳" label="Recipe" />
        <Link
          href="/shared"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <NavItem icon="🤝" label="Share" />
        </Link>
        <NavItem icon="💬" label="Chat" />
        <NavItem icon="👤" label="My Page" />
      </nav>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      style={{
        textAlign: "center",
        cursor: "pointer",
        opacity: active ? 1 : 0.4,
      }}
    >
      <div style={{ fontSize: "20px" }}>{icon}</div>
      <div
        style={{
          fontSize: "10px",
          fontWeight: active ? "800" : "500",
          marginTop: "4px",
        }}
      >
        {label}
      </div>
    </div>
  );
}
