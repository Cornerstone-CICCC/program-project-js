"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function MyPage() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLocation, setNewLocation] = useState("");

  // 저장 함수
  const handleLocationUpdate = async () => {
    if (!newLocation.trim()) return alert("위치를 입력해주세요!");

    const res = await fetch("/api/user/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" }, // 중요: JSON임을 알림
      body: JSON.stringify({ location: newLocation }),
    });

    if (res.ok) {
      const result = await res.json();
      setUserData({ ...userData, location: result.location });
      setIsModalOpen(false);
    } else {
      alert("저장에 실패했습니다.");
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/user/me");
        if (res.ok) {
          const data = await res.json();
          setUserData(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") fetchUserData();
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc]">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "40px 20px 120px 20px",
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#fcfcfc",
        minHeight: "100vh",
        position: "relative", // 추가해주면 좋습니다
      }}
    >
      {/* 1. 프로필 헤더 */}
      <div className="bg-white px-6 py-8 rounded-[32px] shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-gray-100 mb-8">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-20 h-20 bg-orange-100 rounded-[28px] flex items-center justify-center text-3xl shadow-inner border-2 border-orange-50 font-black text-orange-500">
            {session?.user?.name ? session.user.name[0] : "👤"}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">
                {session?.user?.name}님
              </h2>
              <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-lg font-bold">
                LV.{userData?.level || 1}
              </span>
            </div>
            <p className="text-gray-400 text-sm font-medium mt-1">
              {session?.user?.email}
            </p>
          </div>
        </div>

        {/* 2. 통계 대시보드 (신뢰등급 제거 후 2컬럼 배치) */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="보관 재료"
            value={userData?.ingredientCount || 0}
            unit="개"
            color="text-blue-500"
            bgColor="bg-blue-50/30"
          />
          <StatCard
            label="나눔 완료"
            value={userData?.sharedCount || 0}
            unit="건"
            color="text-orange-500"
            bgColor="bg-orange-50/30"
          />
        </div>
      </div>

      {/* 3. 메뉴 리스트 */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-gray-300 uppercase tracking-widest ml-2 mb-3">
          Account Settings
        </h3>
        <MenuButton
          icon="📍"
          title="나의 위치 설정"
          description={userData?.location || "위치를 설정해주세요"}
          onClick={() => {
            setNewLocation(userData?.location || "");
            setIsModalOpen(true);
          }}
        />
        <MenuButton
          icon="🔔"
          title="알림 설정"
          description="유통기한 임박 알림"
        />

        <Link href="/mypage/shared">
          <MenuButton icon="🛒" title="나의 나눔 내역" />
        </Link>

        <div className="pt-6">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-500 font-bold rounded-2xl hover:bg-red-100 transition-colors"
          >
            로그아웃
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

      {/* 위치 설정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          {/* 배경 블러 처리 */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          {/* 모달 콘텐츠 */}
          <div className="relative bg-white w-full max-w-[500px] rounded-[32px] p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-300">
            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-800">
                  나의 위치 설정 📍
                </h3>
                <p className="text-sm text-gray-400 font-medium">
                  상세 주소(예: B동 302호)를 입력하면
                  <br />
                  이웃이 물건을 찾기 훨씬 수월해져요!
                </p>
              </div>

              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="예: B동 302호"
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-orange-500 focus:outline-none font-bold text-gray-700 transition-all"
                autoFocus
              />

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 p-4 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleLocationUpdate}
                  className="flex-[2] p-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all"
                >
                  저장하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, unit, color, bgColor }: any) {
  return (
    <div
      className={`${bgColor} p-5 rounded-2xl border border-gray-100/50 text-center`}
    >
      <div className="text-[11px] font-bold text-gray-400 uppercase mb-2 tracking-tight">
        {label}
      </div>
      <div className={`text-2xl font-black ${color}`}>
        {value}
        <span className="text-sm font-normal ml-0.5 text-gray-400">{unit}</span>
      </div>
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
function MenuButton({ icon, title, description, onClick }: any) {
  return (
    <button
      onClick={onClick} // 클릭 이벤트 추가
      className="w-full flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:border-orange-100 hover:bg-orange-50/20 transition-all group"
    >
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
