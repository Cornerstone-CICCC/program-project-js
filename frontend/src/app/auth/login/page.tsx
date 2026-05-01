"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password. Please check again.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Login error occurred:", error);
      toast.error("Failed to connect to the server. Please try later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      {/* 상단 헤더 섹션 */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={logoWrapperStyle}>
          <span style={{ fontSize: "44px" }}>🧊</span>
        </div>
        <h1
          style={{
            fontSize: "30px",
            fontWeight: "800",
            color: "#111827",
            letterSpacing: "-0.5px",
          }}
        >
          Welcome!
        </h1>
        <p
          style={{
            color: "#6b7280",
            marginTop: "12px",
            fontSize: "15px",
            lineHeight: "1.5",
          }}
        >
          Manage your own fridge
          <br />
          and share fresh food with your neighbors.
        </p>
      </div>

      {/* 로그인 폼 */}
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "14px" }}
      >
        <div style={inputGroupStyle}>
          <input
            type="email"
            placeholder="email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div style={inputGroupStyle}>
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            ...buttonStyle,
            opacity: isLoading ? 0.7 : 1,
            transform: isLoading ? "scale(0.98)" : "scale(1)",
          }}
        >
          {isLoading ? "Logging in..." : "Log in"}
        </button>
      </form>

      {/* 하단 링크 */}
      <div style={footerStyle}>
        New here?{" "}
        <Link href="/auth/signup" style={linkStyle}>
          Sign up
        </Link>
      </div>
    </div>
  );
}

// --- Styles ---

const containerStyle: React.CSSProperties = {
  padding: "100px 24px",
  maxWidth: "420px",
  margin: "0 auto",
  fontFamily:
    "Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif",
  minHeight: "100vh",
  boxSizing: "border-box",
};

const logoWrapperStyle: React.CSSProperties = {
  width: "80px",
  height: "80px",
  backgroundColor: "#eff6ff",
  borderRadius: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 24px",
};

const inputGroupStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "18px 20px",
  borderRadius: "16px",
  border: "1.5px solid #f3f4f6",
  backgroundColor: "#f9fafb",
  fontSize: "16px",
  outline: "none",
  transition: "all 0.2s ease",
  boxSizing: "border-box",
  color: "#1f2937",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "18px",
  backgroundColor: "#3b82f6",
  color: "white",
  border: "none",
  borderRadius: "16px",
  fontSize: "16px",
  fontWeight: "700",
  cursor: "pointer",
  marginTop: "12px",
  boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3)",
  transition: "all 0.2s ease",
};

const footerStyle: React.CSSProperties = {
  marginTop: "32px",
  textAlign: "center",
  fontSize: "14px",
  color: "#9ca3af",
};

const linkStyle: React.CSSProperties = {
  color: "#3b82f6",
  fontWeight: "700",
  textDecoration: "none",
  marginLeft: "6px",
};
