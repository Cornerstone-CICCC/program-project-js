"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddIngredientPage() {
  const [name, setName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !expiryDate)
      return alert("재료 이름과 유통기한을 입력해주세요!");

    setLoading(true);
    try {
      const res = await fetch("/api/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, expiryDate }),
      });

      if (res.ok) {
        // 1. 서버 데이터를 다시 불러오라고 신호를 보냄
        router.refresh();
        // 2. 잠시 후 메인으로 이동 (DB 동기화 시간 확보)
        setTimeout(() => {
          router.push("/");
        }, 100);
      } else {
        alert("저장에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "40px 20px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        maxWidth: "500px",
        margin: "0 auto",
        minHeight: "100vh",
        backgroundColor: "#fcfcfc",
      }}
    >
      {/* 뒤로가기 버튼 */}
      <Link
        href="/"
        style={{
          display: "inline-block",
          marginBottom: "20px",
          color: "#6b7280",
          textDecoration: "none",
          fontSize: "14px",
          fontWeight: "600",
        }}
      >
        ← 돌아가기
      </Link>

      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "20px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
          border: "1px solid #f3f4f6",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "800",
            marginBottom: "25px",
            color: "#111827",
          }}
        >
          새로운 재료 추가 🍎
        </h1>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          {/* 재료 이름 입력 */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "700",
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              재료 이름
            </label>
            <input
              type="text"
              placeholder="예: 사과, 우유, 고기"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 15px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
                fontSize: "16px",
                boxSizing: "border-box",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
            />
          </div>

          {/* 유통기한 입력 */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "700",
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              유통기한
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 15px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
                fontSize: "16px",
                boxSizing: "border-box",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* 추가 버튼 */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "10px",
              padding: "15px",
              backgroundColor: loading ? "#ccc" : "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "700",
              cursor: loading ? "default" : "pointer",
              transition: "background-color 0.2s",
              boxShadow: "0 4px 6px rgba(59, 130, 246, 0.2)",
            }}
          >
            {loading ? "저장 중..." : "냉장고에 넣기 🧊"}
          </button>
        </form>
      </div>

      <p
        style={{
          textAlign: "center",
          marginTop: "20px",
          color: "#9ca3af",
          fontSize: "13px",
        }}
      >
        정확한 유통기한 입력은 신선한 요리의 시작입니다!
      </p>
    </div>
  );
}
