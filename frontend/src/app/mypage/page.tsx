"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function MyPage() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    firstName: userData?.firstName || "",
    lastName: userData?.lastName || "",
    currentPassword: "",
    nextPassword: "",
  });

  const handleSecurityUpdate = async () => {
    // 로딩 상태를 보여주는 toast.promise를 쓰면 더 고급스러워요!
    const updatePromise = fetch("/api/user/change-password", {
      method: "PATCH",
      body: JSON.stringify(editData),
    });

    toast.promise(updatePromise, {
      loading: "Updating profile...",
      success: (res) => {
        if (!res.ok) throw new Error("Update failed");

        setIsSecurityModalOpen(false);
        // 데이터 갱신 (새로고침보다 효율적인 router.refresh 권장)
        setTimeout(() => window.location.reload(), 1000);
        return "Profile updated successfully! ✨";
      },
      error: "Check your current password and try again.",
    });
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
            {/* ✅ 수정: session 대신 DB에서 가져온 userData 사용 */}
            {userData?.firstName
              ? userData.firstName[0]
              : session?.user?.name
                ? session.user.name[0]
                : "👤"}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {/* ✅ 수정: DB에 저장된 성과 이름을 합쳐서 표시 */}
                {userData
                  ? `${userData.firstName} ${userData.lastName}`
                  : session?.user?.name}
              </h2>
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
          Manage Account
        </h3>

        {/* 나눔 내역 */}
        <Link href="/mypage/shared">
          <MenuButton
            icon="📦"
            title="My Shared History"
            description="View your shared items list"
          />
        </Link>

        {/* 비밀번호 변경 (추천: 전용 버튼) */}
        <MenuButton
          icon="🔐"
          title="Security Setting"
          description="Change your account password"
          onClick={() => setIsSecurityModalOpen(true)}
        />

        {/* 로그아웃 */}
        <div className="pt-6">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 p-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-blue-50 hover:text-blue-500 transition-all border border-transparent hover:border-red-100"
          >
            Logout
          </button>
        </div>
      </div>

      {isSecurityModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsSecurityModalOpen(false)}
          />
          <div className="relative bg-white w-full max-w-[500px] rounded-[32px] p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-10">
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  Edit Profile & Security 🔐
                </h3>
                <p className="text-sm text-slate-400 font-medium mt-1">
                  Update your name or change password
                </p>
              </div>

              <div className="space-y-3">
                {/* 성함 수정 (2열) */}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={editData.firstName}
                    className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 outline-none font-bold"
                    onChange={(e) =>
                      setEditData({ ...editData, firstName: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={editData.lastName}
                    className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 outline-none font-bold"
                    onChange={(e) =>
                      setEditData({ ...editData, lastName: e.target.value })
                    }
                  />
                </div>

                <hr className="my-2 border-slate-100" />

                {/* 비밀번호 수정 */}
                <input
                  type="password"
                  placeholder="Current Password (To change password)"
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 outline-none font-bold"
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      currentPassword: e.target.value,
                    })
                  }
                />
                <input
                  type="password"
                  placeholder="New Password"
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 outline-none font-bold"
                  onChange={(e) =>
                    setEditData({ ...editData, nextPassword: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setIsSecurityModalOpen(false)}
                  className="flex-1 p-4 bg-slate-100 text-slate-500 font-bold rounded-2xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSecurityUpdate}
                  className="flex-[2] p-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
                >
                  Save Changes
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
