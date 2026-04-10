"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 📝 백엔드 API 경로가 /api/login 인지 /api/auth/login 인지 확인 필요!
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ 로그인 성공 시 메인 페이지로 이동 및 데이터 갱신
        router.push("/");
        router.refresh();
      } else {
        setError(data.error || "로그인에 실패했습니다.");
      }
    } catch (err) {
      setError("서버와 통신 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Welcome Back! 🧊</h1>
        <p style={subtitleStyle}>냉장고를 관리하러 가볼까요?</p>

        <form onSubmit={handleLogin} style={formStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>이메일</label>
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>비밀번호</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          {error && <p style={errorStyle}>{error}</p>}

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div style={footerStyle}>
          아직 계정이 없으신가요?{" "}
          <Link href="/signup" style={linkStyle}>
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}

// --- Styles (인라인 스타일로 깔끔하게 정리) ---

const containerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  backgroundColor: "#f9fafb",
  padding: "20px",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "white",
  padding: "40px",
  borderRadius: "24px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  width: "100%",
  maxWidth: "400px",
  textAlign: "center",
};

const titleStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "800",
  marginBottom: "8px",
  color: "#111827",
};

const subtitleStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#6b7280",
  marginBottom: "32px",
};

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  textAlign: "left",
};

const inputGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const labelStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#374151",
};

const inputStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  fontSize: "14px",
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  padding: "14px",
  borderRadius: "12px",
  border: "none",
  backgroundColor: "#3b82f6",
  color: "white",
  fontSize: "16px",
  fontWeight: "700",
  cursor: "pointer",
  marginTop: "10px",
  transition: "background-color 0.2s",
};

const errorStyle: React.CSSProperties = {
  color: "#ef4444",
  fontSize: "13px",
  marginTop: "-10px",
};

const footerStyle: React.CSSProperties = {
  marginTop: "24px",
  fontSize: "14px",
  color: "#6b7280",
};

const linkStyle: React.CSSProperties = {
  color: "#3b82f6",
  textDecoration: "none",
  fontWeight: "600",
};
