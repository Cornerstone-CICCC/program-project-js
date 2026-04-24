"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Package, CheckCircle2, Clock } from "lucide-react";
import toast from "react-hot-toast";

interface SharedItem {
  id: string;
  name: string;
  category: string;
  imageUrl: string | null;
  availabilityStatus: string; // "available" | "completed"
  createdAt: string;
}

export default function MySharedPage() {
  const router = useRouter();
  const [items, setItems] = useState<SharedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "available" | "completed">(
    "all",
  );

  // 1. 데이터 가져오기
  const fetchSharedItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/shared"); // 내 나눔 아이템을 가져오는 API (별도 생성 필요)
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error(error);
      toast.error("Could not load sharing records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSharedItems();
  }, [fetchSharedItems]);

  // 2. 나눔 상태 변경 함수 (나눔 완료하기)
  const handleComplete = async (id: string) => {
    try {
      const res = await fetch(`/api/shared/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availabilityStatus: "completed" }),
      });

      if (res.ok) {
        toast.success("Sharing completed! 🎁");
        fetchSharedItems(); // 목록 새로고침
      }
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  const filteredItems = items
    .filter((item) =>
      activeTab === "all" ? true : item.availabilityStatus === activeTab,
    )
    .sort((a, b) => {
      // availabilityStatus가 "available"인 것을 우선순위로 둠
      if (
        a.availabilityStatus === "available" &&
        b.availabilityStatus === "completed"
      )
        return -1;
      if (
        a.availabilityStatus === "completed" &&
        b.availabilityStatus === "available"
      )
        return 1;

      // 같은 상태 내에서는 최신순으로 정렬
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const completedCount = items.filter(
    (i) => i.availabilityStatus === "completed",
  ).length;

  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-white p-4 pb-24">
      {/* 상단 헤더 & 뒤로가기 */}
      <div className="flex items-center gap-4 mb-6 pt-2">
        <button
          onClick={() => router.back()} // ✅ 뒤로가기 기능
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">My Sharing Overview</h1>
      </div>

      {/* 누적 통계 카드 */}
      <div className="bg-blue-50 rounded-[24px] p-6 mb-8 border border-blue-100 flex justify-between items-center shadow-sm">
        <div>
          <p className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            Successful Shares
          </p>
          <p className="text-3xl font-black text-blue-900">{completedCount}</p>
        </div>
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-2xl">
          🎁
        </div>
      </div>

      {/* 상태 필터 탭 */}
      <div className="flex p-1 bg-gray-100 rounded-2xl mb-6">
        {[
          { id: "all", label: "All" },
          { id: "available", label: "Sharing" },
          { id: "completed", label: "Completed" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 아이템 리스트 */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Loading...</div>
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-100 rounded-[24px] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex gap-4"
            >
              {/* 이미지 영역 */}
              <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-50">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Package className="w-8 h-8" />
                  </div>
                )}
              </div>

              {/* 정보 영역 */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                        item.availabilityStatus === "available"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {item.availabilityStatus === "available"
                        ? "Sharing"
                        : "Completed"}
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mt-1">{item.name}</h3>
                  <p className="text-xs text-gray-500">{item.category}</p>
                </div>

                {/* 버튼 영역 */}
                <div className="flex gap-2 mt-3">
                  {item.availabilityStatus === "available" ? (
                    <>
                      {/* 1. 나눔 중일 때만 보이는 버튼들 */}
                      <button
                        onClick={() => router.push(`/shared/edit/${item.id}`)}
                        className="flex-1 py-2 text-xs font-bold border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleComplete(item.id)}
                        className="flex-[2] py-2 text-xs font-bold bg-blue-500 text-white rounded-xl hover:bg-blue-600 shadow-sm transition-all flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </button>
                    </>
                  ) : (
                    /* 2. 나눔 완료 상태일 때 보이는 표시 */
                    <div className="flex-1 flex items-center justify-center py-2 bg-gray-50 border border-gray-100 rounded-xl">
                      <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-gray-300" />
                        Completed
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package className="w-12 h-12 text-gray-200 mb-4" />
            <p className="text-gray-400 font-medium">No items found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
