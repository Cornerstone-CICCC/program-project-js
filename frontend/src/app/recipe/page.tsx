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
      alert("냉장고에 재료가 없으면 레시피를 추천받을 수 없습니다! 🍎");
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

      if (!res.ok) throw new Error("API 요청 실패");

      const data = await res.json();
      const fullText = data.suggestion;

      const lines = fullText
        .split("\n")
        .map((line: string) => line.replace(/[#*]/g, "").trim())
        .filter((line: string) => line.length > 0);

      setRecipe({
        title: lines[0] || "추천 레시피",
        steps: lines.slice(1),
      });
    } catch (error) {
      console.error("레시피 로드 실패:", error);
      alert("AI 레시피를 가져오지 못했습니다. API 키를 확인해주세요!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "40px 20px 120px 20px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#fcfcfc",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "10px" }}>
        🍳 AI 추천 레시피
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "30px", fontSize: "14px" }}>
        내 냉장고 속 재료로 만들 수 있는 요리를 AI가 알려드려요.
      </p>

      <button
        onClick={generateRecipe}
        disabled={loading}
        style={{
          width: "100%",
          padding: "16px",
          backgroundColor: loading ? "#ccc" : "#9333ea",
          color: "white",
          borderRadius: "16px",
          border: "none",
          fontWeight: "bold",
          fontSize: "16px",
          cursor: loading ? "default" : "pointer",
          boxShadow: "0 4px 12px rgba(147, 51, 234, 0.2)",
          marginBottom: "30px",
        }}
      >
        {loading ? "🪄 요리법 생각 중..." : "🪄 오늘의 추천 레시피 받기"}
      </button>

      {recipe && (
        <div
          style={{
            backgroundColor: "#fffbeb",
            padding: "25px",
            borderRadius: "24px",
            border: "2px solid #fef3c7",
            animation: "fadeIn 0.5s ease-in",
          }}
        >
          <h2
            style={{
              color: "#92400e",
              fontSize: "20px",
              fontWeight: "800",
              marginTop: 0,
              marginBottom: "15px",
            }}
          >
            {recipe.title}
          </h2>
          <div
            style={{ color: "#4b5563", lineHeight: "1.8", fontSize: "15px" }}
          >
            {recipe.steps.map((s: string, i: number) => (
              <p key={i} style={{ marginBottom: "10px" }}>
                {s}
              </p>
            ))}
          </div>
        </div>
      )}

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
