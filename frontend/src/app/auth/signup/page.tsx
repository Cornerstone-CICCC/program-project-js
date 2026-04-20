"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { checkPasswordStrength } from "@/utils/passwordCheck"; // 아까 만든 유틸 함수
import toast from "react-hot-toast"; // ✅ 라이브러리 임포트

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [strength, setStrength] = useState({
    score: 0,
    label: "None",
    color: "#e5e7eb",
  });
  const [loading, setLoading] = useState(false);

  // 실시간 비밀번호 강도 체크
  useEffect(() => {
    setStrength(checkPasswordStrength(formData.password));
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (strength.score < 4) {
      return alert(
        "For security, please enter a stronger password! (Include uppercase, lowercase, numbers, and special characters)",
      );
    }

    setLoading(true);
    try {
      const res = await fetch("/public-api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        // ✅ Success toast: Disappears automatically
        toast.success(
          "Signup successful! Please verify your email before logging in. 📧",
          {
            duration: 4000,
          },
        );
        router.push("/auth/login");
      } else {
        const data = await res.json();
        // ✅ Error toast: Displays the specific server error
        toast.error(data.error || "Signup failed. Please try again.");
      }
    } catch (err) {
      // ✅ Catch-all for network or unexpected errors
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#111" }}>
            Join Us! 🥬
          </h1>
          <p style={{ color: "#666", marginTop: "8px" }}>
            Start enjoying the joy of sharing today.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "18px" }}
        >
          {/* 이름 입력 영역 */}
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>First Name</label>
              <input
                required
                style={inputStyle}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Last Name</label>
              <input
                required
                style={inputStyle}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </div>
          </div>

          {/* 이메일 입력 */}
          <div>
            <label style={labelStyle}>Email Address</label>
            <input
              required
              type="email"
              placeholder="example@email.com"
              style={inputStyle}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          {/* 비밀번호 입력 및 강도 체크 */}
          <div>
            <label style={labelStyle}>Password</label>
            <input
              required
              type="password"
              placeholder="••••••••"
              style={{
                ...inputStyle,
                border: formData.password
                  ? `1.5px solid ${strength.color}`
                  : "1.5px solid #eee",
              }}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            {/* 비밀번호 강도 게이지 시각화 */}
            <div style={strengthBarContainer}>
              <div
                style={{
                  ...strengthBarFill,
                  width: `${(strength.score / 5) * 100}%`,
                  backgroundColor: strength.color,
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "6px",
              }}
            >
              <span style={{ fontSize: "12px", color: "#999" }}>
                Password Strength
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: strength.color,
                  fontWeight: "bold",
                }}
              >
                {strength.label}
              </span>
            </div>
          </div>

          <button type="submit" disabled={loading} style={submitBtnStyle}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "25px",
            fontSize: "14px",
            color: "#666",
          }}
        >
          Already have an account?{" "}
          <Link
            href="/auth/login"
            style={{
              color: "#10b981",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

// --- Styles ---
const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  backgroundColor: "#f3f4f6",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "white",
  padding: "40px",
  borderRadius: "30px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  width: "100%",
  maxWidth: "450px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: "700",
  marginBottom: "8px",
  color: "#4b5563",
  marginLeft: "4px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1.5px solid #eee",
  backgroundColor: "#fafafa",
  outline: "none",
  fontSize: "15px",
  transition: "0.2s ease-in-out",
};

const strengthBarContainer: React.CSSProperties = {
  height: "6px",
  backgroundColor: "#eee",
  borderRadius: "10px",
  marginTop: "12px",
  overflow: "hidden",
};

const strengthBarFill: React.CSSProperties = {
  height: "100%",
  transition: "all 0.4s ease-in-out",
};

const submitBtnStyle: React.CSSProperties = {
  marginTop: "10px",
  padding: "16px",
  borderRadius: "16px",
  backgroundColor: "#10b981",
  color: "white",
  border: "none",
  fontSize: "16px",
  fontWeight: "800",
  cursor: "pointer",
  boxShadow: "0 6px 20px rgba(16, 185, 129, 0.25)",
  transition: "0.2s",
};
