"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function MyPage() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/user/me");
        if (res.ok) {
          const data = await res.json();
          setUserData(data);
        }
      } catch (err) {
        console.error("유저 데이터 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchUserData();
    }
  }, [status]);

  // 1. 세션 로딩 중이거나 API 데이터 로딩 중일 때
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-gray-400 font-medium">정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 통계 데이터 계산
  const stats = [
    {
      label: "보관 재료",
      value: userData?.ingredients?.length || 0,
      unit: "개",
      color: "text-blue-500",
    },
    {
      label: "나눔 완료",
      value: userData?.sharedItems?.length || 0,
      unit: "건",
      color: "text-orange-500",
    },
    {
      label: "신뢰 등급",
      value: userData?.rating?.toFixed(1) || "0.0",
      unit: "★",
      color: "text-yellow-500",
    },
  ];

  return (
    <div
      style={{
        padding: "40px 20px 120px 20px",
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#fcfcfc",
        minHeight: "100vh",
      }}
    >
      {/* 프로필 헤더 */}
      <div className="bg-white px-6 py-8 rounded-[32px] shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-gray-100 mb-8">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-20 h-20 bg-orange-100 rounded-[28px] flex items-center justify-center text-3xl shadow-inner border-2 border-orange-50 overflow-hidden">
            <span className="text-orange-500 font-black">
              {session?.user?.name ? session.user.name[0] : "👤"}
            </span>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">
                {session?.user?.name || "사용자"}님
              </h2>
              <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-lg font-bold">
                LV.{userData?.level || 1}
              </span>
            </div>
            <p className="text-gray-400 text-sm font-medium mt-1">
              {session?.user?.email}
            </p>
          </div>

          <button className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>

        {/* 통계 대시보드 (실제 데이터 반영됨) */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50 text-center"
            >
              <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-tight">
                {stat.label}
              </div>
              <div className={`text-lg font-black ${stat.color}`}>
                {stat.value}
                <span className="text-xs font-normal ml-0.5">{stat.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 메뉴 리스트 */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-gray-300 uppercase tracking-widest ml-2 mb-3">
          Account Settings
        </h3>
        <MenuButton
          icon="📍"
          title="나의 위치 설정"
          description={userData?.location || "위치를 설정해주세요"}
        />
        <MenuButton icon="🛒" title="나의 나눔 내역" />
        <MenuButton icon="⭐" title="즐겨찾는 레시피" />

        <div className="pt-6">
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-500 font-bold rounded-2xl hover:bg-red-100 transition-colors border border-red-100/50"
          >
            <span>로그아웃</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* 하단 내비게이션 바 - 메인과 동일한 스타일 적용 */}
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
          <NavItem icon="🍳" label="Recipe" />
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
          <NavItem icon="👤" label="My" active />
        </Link>
      </nav>
    </div>
  );
}

// 🏠 내비게이션 아이템
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

// 🔘 메뉴 버튼
function MenuButton({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description?: string;
}) {
  return (
    <button className="w-full flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:border-orange-100 hover:bg-orange-50/20 transition-all group shadow-sm shadow-black/[0.01]">
      <span className="text-2xl">{icon}</span>
      <div className="text-left">
        <div className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors text-sm">
          {title}
        </div>
        {description && (
          <div className="text-[11px] text-gray-400 font-medium mt-0.5">
            {description}
          </div>
        )}
      </div>
      <svg
        className="ml-auto w-4 h-4 text-gray-300 group-hover:text-orange-300 transition-colors"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        viewBox="0 0 24 24"
      >
        <path d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
