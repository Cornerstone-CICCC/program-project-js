"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function RecipePage() {
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 냉장고 재료 가져오기
    fetch("/api/ingredients")
      .then((res) => res.json())
      .then((data) => setIngredients(Array.isArray(data) ? data : []));
  }, []);

  const generateRecipe = async () => {
    if (ingredients.length === 0) {
      alert(
        "You need ingredients in your fridge to get recipe recommendations!🍎",
      );
      return;
    }

    setLoading(true);
    setRecipe(null);

    try {
      const ingredientNames = ingredients.map((ing) => ing.name).join(", ");

      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemName: ingredientNames,
          type: "recipe",
        }),
      });

      // ✅ 1. 데이터를 한 번만 읽어서 변수에 저장합니다.
      const data = await res.json();

      // ✅ 2. 응답이 실패했을 경우 서버가 보낸 에러 메시지를 확인합니다.
      if (!res.ok) {
        console.error("Server error details:", data);
        throw new Error(data.error || "API request failed");
      }

      // ✅ 3. 이미 읽은 data 변수를 사용합니다.
      const fullText = data.suggestion;
      if (!fullText) throw new Error("No recommended recipes found.");

      const lines = fullText
        .split("\n")
        .map((line: string) => line.replace(/[#*]/g, "").trim())
        .filter((line: string) => line.length > 0);

      setRecipe({
        title: lines[0] || "Recommended Recipe",
        steps: lines.slice(1),
      });
    } catch (error: any) {
      console.error("Failed to load recipe:", error);
      alert(error.message || "Failed to fetch AI recipe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "40px 24px 120px 24px",
        fontFamily: "Inter, -apple-system, system-ui, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        minHeight: "100vh",
        color: "#1a1a1a",
      }}
    >
      {/* Header Section */}
      <header style={{ marginBottom: "48px", textAlign: "center" }}>
        {/* 아이콘 박스: 연한 블루 틴트와 부드러운 그림자 */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "72px",
            height: "72px",
            backgroundColor: "#eff6ff", // 매우 연한 블루 (#2563eb의 틴트)
            borderRadius: "24px",
            marginBottom: "20px",
            fontSize: "36px",
            boxShadow: "0 8px 20px rgba(37, 99, 235, 0.08)", // 은은한 블루 그림자
            border: "1px solid rgba(37, 99, 235, 0.1)",
          }}
        >
          👨‍🍳
        </div>

        <h1
          style={{
            fontSize: "36px",
            fontWeight: "900",
            color: "#1e293b", // 깊은 다크 네이비로 신뢰감 상승
            marginBottom: "14px",
            letterSpacing: "-1.5px",
            lineHeight: "1.2",
          }}
        >
          Chef AI <span style={{ color: "#2563eb" }}>Curation</span>
        </h1>

        {/* 설명 문구: 자간과 행간을 넓혀 가독성 향상 */}
        <p
          style={{
            color: "#64748b", // Slate 500 계열로 세련된 회색
            fontSize: "15px",
            lineHeight: "1.7",
            maxWidth: "340px",
            margin: "0 auto",
            fontWeight: "500",
            letterSpacing: "-0.2px",
          }}
        >
          Unlock professional gastronomic creations
          <br />
          tailored to your current pantry.
        </p>

        {/* 하단 구분선: 전문적인 느낌을 주는 짧은 장식선 */}
        <div
          style={{
            width: "40px",
            height: "4px",
            backgroundColor: "#2563eb",
            margin: "24px auto 0",
            borderRadius: "2px",
            opacity: 0.3,
          }}
        />
      </header>

      {/* Professional Action Button */}
      <div style={{ position: "relative", marginBottom: "48px" }}>
        <button
          onClick={generateRecipe}
          disabled={loading}
          className="recipe-btn"
          style={{
            width: "100%",
            padding: "22px",
            // ✅ 메인 블루(#2563eb)를 기준으로 한 그라데이션
            background: loading
              ? "#93c5fd" // 로딩 중일 때는 연한 블루로 변경
              : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            color: "white",
            borderRadius: "20px",
            border: "none",
            fontWeight: "800",
            fontSize: "18px",
            cursor: loading ? "default" : "pointer",
            // ✅ 블루 컬러에 맞춘 부드러운 그림자 (Alpha 0.3)
            boxShadow: loading ? "none" : "0 12px 30px rgba(37, 99, 235, 0.3)",
            transition: "all 0.2s ease", // transform 외에 배경색 변화도 부드럽게
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          {loading ? (
            <>
              {/* 스피너 색상도 흰색/연청색 계열로 유지된다고 가정 */}
              <div className="spinner" style={{ borderTopColor: "white" }} />
              <span style={{ color: "white" }}>Analyzing Flavors...</span>
            </>
          ) : (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 9.75 0A4 4 0 0 1 18 13.87M12 21V11m0 10l-3-3m3 3l3-3" />
              </svg>
              Generate Premium Recipe
            </>
          )}
        </button>
      </div>

      {/* Recipe Masterpiece Card */}
      {recipe && (
        <div
          className="fade-in"
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "32px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 25px 50px -12px rgba(37, 99, 235, 0.1)",
            overflow: "hidden",
            marginTop: "24px",
          }}
        >
          {/* 상단 포인트 라인: 블루 단색 혹은 아주 은은한 블루 그라데이션 */}
          <div
            style={{
              height: "12px",
              background: "linear-gradient(90deg, #2563eb, #1d4ed8)",
            }}
          />

          <div style={{ padding: "48px 32px" }}>
            {/* 1. 요리 제목 */}
            <div
              style={{
                marginBottom: "48px",
                borderBottom: "2px solid #f1f5f9",
                paddingBottom: "32px",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  backgroundColor: "#eff6ff", // 연한 블루
                  color: "#2563eb", // 메인 블루
                  padding: "8px 16px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "900",
                  marginBottom: "20px",
                  letterSpacing: "1.5px",
                  border: "1px solid rgba(37, 99, 235, 0.1)",
                }}
              >
                ✦ CHEF'S MASTERPIECE
              </div>
              <h2
                style={{
                  fontSize: "36px",
                  fontWeight: "1000",
                  color: "#1e293b", // 다크 슬레이트
                  lineHeight: "1.2",
                  letterSpacing: "-1.5px",
                  margin: 0,
                }}
              >
                {recipe.title}
              </h2>
            </div>

            {/* 2. 요리 단계 */}
            <div>
              <h3
                style={{
                  fontSize: "22px",
                  fontWeight: "900",
                  color: "#1e293b",
                  marginBottom: "32px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "22px",
                    backgroundColor: "#2563eb", // 포인트 바 블루로 변경
                    borderRadius: "3px",
                  }}
                />
                Culinary Process
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "40px",
                }}
              >
                {recipe.steps.map((step: string, index: number) => (
                  <div key={index} style={{ display: "flex", gap: "28px" }}>
                    <div style={{ flex: 1, paddingTop: "4px" }}>
                      <p
                        style={{
                          fontSize: "18px",
                          color: "#475569", // 가독성 좋은 슬레이트 그레이
                          lineHeight: "1.8",
                          margin: 0,
                          fontWeight: "500",
                          letterSpacing: "-0.2px",
                          wordBreak: "keep-all",
                        }}
                      >
                        {step}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. 하단 팁 (카드 형태) */}
            <div
              style={{
                marginTop: "60px",
                padding: "32px",
                backgroundColor: "#f8fafc", // 더 깔끔한 배경색
                borderRadius: "28px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "12px",
                }}
              >
                <span style={{ fontSize: "24px" }}>💡</span>
                <span
                  style={{
                    fontWeight: "900",
                    color: "#2563eb", // 제목 강조 블루
                    fontSize: "16px",
                  }}
                >
                  Chef's Secret Note
                </span>
              </div>
              <p
                style={{
                  fontSize: "15px",
                  color: "#64748b",
                  fontWeight: "600",
                  margin: 0,
                  lineHeight: "1.6",
                }}
              >
                Serve this dish on a warm plate to maintain the delicate
                temperature of the ingredients. A dash of extra virgin olive oil
                before serving adds a professional finishing touch.
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .recipe-btn:active {
          transform: scale(0.98);
        }
        .fade-in {
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(147, 51, 234, 0.1);
          border-top-color: #9333ea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      {/* 하단 내비게이션 바 */}
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
          <NavItem icon="🏠" label="Home" />
        </Link>
        <Link
          href="/recipe"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <NavItem icon="🍳" label="Recipe" active />
        </Link>
        <Link
          href="/shared"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <NavItem icon="🤝" label="Share" />
        </Link>
        <Link href="/chat" style={{ textDecoration: "none", color: "inherit" }}>
          <NavItem icon="💬" label="Chat" />
        </Link>
        <Link
          href="/mypage"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <NavItem icon="👤" label="My" />
        </Link>
      </nav>
    </div>
  );
}

// 🏠 내비게이션 아이템 함수형 컴포넌트 (파일 하단에 포함)
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
