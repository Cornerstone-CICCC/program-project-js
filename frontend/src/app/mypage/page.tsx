"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function MyPage() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLocation, setNewLocation] = useState("");

  // 저장 함수
  const handleLocationUpdate = async () => {
    if (!newLocation.trim()) {
      toast.error("Please enter a location! 📍");
      return;
    }

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
      // 3. 서버 에러 발생 시
      toast.error("Failed to save location. Please try again.");
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
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
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
        position: "relative",
      }}
    >
      {/* 1. 프로필 헤더 */}
      <div className="bg-white px-6 py-8 rounded-[32px] shadow-[0_10px_40px_rgba(37,99,235,0.04)] border border-slate-50 mb-8">
        <div className="flex items-center gap-5 mb-6">
          {/* 아바타 배경색 블루 틴트로 변경 */}
          <div className="w-20 h-20 bg-blue-50 rounded-[28px] flex items-center justify-center text-3xl shadow-inner border-2 border-blue-100 font-black text-blue-600">
            {session?.user?.name ? session.user.name[0] : "👤"}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {session?.user?.name}
              </h2>
              {/* 레벨 뱃지 블루로 변경 */}
              <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-lg font-bold">
                LV.{userData?.level || 1}
              </span>
            </div>
            <p className="text-slate-400 text-sm font-medium mt-1">
              {session?.user?.email}
            </p>
          </div>
        </div>

        {/* 2. 통계 대시보드 (메인 컬러 반영) */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="Stored Ingredients"
            value={userData?.ingredientCount || 0}
            unit="items"
            color="text-blue-600"
            bgColor="bg-blue-50/50"
          />
          <StatCard
            label="Shared Completed"
            value={userData?.sharedCount || 0}
            unit="items"
            color="text-slate-600"
            bgColor="bg-slate-50/50"
          />
        </div>
      </div>

      {/* 3. 메뉴 리스트 */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest ml-2 mb-3">
          Account Settings
        </h3>
        <MenuButton
          icon="📍"
          title="Set My Location"
          description={userData?.location || "Please set your location"}
          onClick={() => {
            setNewLocation(userData?.location || "");
            setIsModalOpen(true);
          }}
        />
        <MenuButton
          icon="🔔"
          title="Notification Settings"
          description="Expiration date reminder alerts"
        />

        <Link href="/mypage/shared">
          <MenuButton icon="🛒" title="My Shared History" />
        </Link>

        <div className="pt-6">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 p-4 bg-slate-50 text-slate-400 font-bold rounded-2xl hover:bg-blue-50 hover:text-blue-500 transition-all"
          >
            Logout
          </button>
        </div>
      </div>

      {/* 위치 설정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative bg-white w-full max-w-[500px] rounded-[32px] p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-300">
            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-800">
                  Set My Location 📍
                </h3>
                <p className="text-sm text-slate-400 font-medium">
                  Enter your detailed address
                  <br />
                  so neighbors can find your items more easily!
                </p>
              </div>

              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Detailed address"
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:outline-none font-bold text-slate-700 transition-all"
                autoFocus
              />

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 p-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLocationUpdate}
                  className="flex-[2] p-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
                >
                  Save
                </button>
              </div>
            </div>
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
      className={cn(
        "text-center cursor-pointer transition-opacity",
        active ? "opacity-100" : "opacity-40",
      )}
    >
      <div className="text-[20px]">{icon}</div>
      <div
        className={cn("text-[10px] mt-1", active ? "font-[800]" : "font-[500]")}
      >
        {label}
      </div>
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

// 🔘 메뉴 버튼
function MenuButton({ icon, title, description, onClick }: any) {
  return (
    <button
      onClick={onClick} // 클릭 이벤트 추가
      className="w-full flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:border-blue-100 hover:bg-blue-50/20 transition-all group"
    >
      <span className="text-2xl">{icon}</span>
      <div className="text-left">
        <div className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors text-sm">
          {title}
        </div>
        {description && (
          <div className="text-[11px] text-gray-400 font-medium mt-0.5">
            {description}
          </div>
        )}
      </div>
      <svg
        className="ml-auto w-4 h-4 text-gray-300 group-hover:text-blue-300 transition-colors"
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
