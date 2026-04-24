"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // <--- 이 줄을 추가하세요!

export default function MySharedHistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null); // 현재 수정 중인 아이템 객체
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // 수정 저장 함수
  const handleUpdateInfo = async () => {
    if (!editName.trim()) return alert("Please enter a name.");

    const res = await fetch(`/api/user/shared/${editingItem.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, description: editDescription }),
    });

    if (res.ok) {
      setItems(
        items.map((item) =>
          item.id === editingItem.id
            ? { ...item, name: editName, description: editDescription }
            : item,
        ),
      );
      setEditingItem(null); // 모달 닫기
    }
  };

  // 1. 상태 변경 함수
  const toggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus =
      currentStatus === "available" ? "completed" : "available";
    const res = await fetch(`/api/user/shared/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ availabilityStatus: nextStatus }),
    });

    if (res.ok) {
      setItems(
        items.map((item) =>
          item.id === id ? { ...item, availabilityStatus: nextStatus } : item,
        ),
      );
    }
  };

  // 2. 삭제 함수
  const deleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    const res = await fetch(`/api/user/shared/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  useEffect(() => {
    const fetchMyItems = async () => {
      try {
        const res = await fetch(`/api/user/shared`); // 쿼리 파라미터 삭제
        if (res.ok) {
          const data = await res.json();
          setItems(data);
        }
      } catch (error) {
        console.error("Failed data load:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyItems();
  }, []);

  return (
    <div
      className="min-h-screen bg-[#fcfcfc] pb-24"
      style={{ maxWidth: "600px", margin: "0 auto" }}
    >
      {/* 상단 헤더 */}
      <div className="flex items-center p-6 bg-white sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-50 rounded-full transition-all"
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="ml-2 text-xl font-black text-gray-800 tracking-tight">
          My Shared Items
        </h1>
      </div>

      {/* 안내 문구 */}
      <div className="px-6 mb-6">
        <p className="text-sm text-gray-400 font-medium">
          These are the ingredients you’ve shared with your neighbors.
        </p>
      </div>

      {/* 아이템 리스트 */}
      <div className="px-6 space-y-4">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[32px] border-2 border-dashed border-gray-100">
            <span className="text-4xl block mb-4">🌱</span>
            <p className="text-gray-400 font-bold">No shared items yet.</p>
          </div>
        ) : (
          // 💡 여기서 {items.map ... } 이 아니라 (items.map ... ) 으로 시작해야 합니다.
          items.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm"
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-blue-50 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl">
                  {item.category === "VEGETABLE" ? "🥦" : "🍎"}
                </div>
                <div className="flex-1 py-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-800">{item.name}</h4>
                    <div className="flex gap-2">
                      {/* 수정 버튼 추가 */}
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setEditName(item.name);
                          setEditDescription(item.description || "");
                        }}
                        className="text-gray-300 hover:text-blue-500 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(item.createdAt).toLocaleDateString()} Registered
                    on
                  </p>
                </div>
              </div>

              {/* 하단 관리 액션바 */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                <button
                  onClick={() => toggleStatus(item.id, item.availabilityStatus)}
                  className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${
                    item.availabilityStatus === "available"
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-100"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {item.availabilityStatus === "available"
                    ? "Mark as Shared"
                    : "Share Again"}
                </button>
                <button className="px-4 py-3 bg-gray-50 text-gray-400 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all">
                  View Chat
                </button>
                <Link
                  href={`/chat?itemId=${item.id}`}
                  className="px-4 py-3 bg-gray-50 text-gray-400 rounded-xl text-xs font-bold hover:bg-blue-50 hover:text-blue-500 transition-all text-center flex items-center justify-center"
                >
                  View Chat
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setEditingItem(null)}
          />
          <div className="relative bg-white w-full max-w-[400px] rounded-[32px] p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              정보 수정하기 ✏️
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-gray-400 ml-1 mb-2 block uppercase">
                  아이템 이름
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:outline-none font-bold transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-black text-gray-400 ml-1 mb-2 block uppercase">
                  상세 설명
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:outline-none font-medium text-sm transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingItem(null)}
                  className="flex-1 p-4 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                >
                  취소
                </button>
                <button
                  onClick={handleUpdateInfo}
                  className="flex-[2] p-4 bg-blue-500 text-white font-bold rounded-2xl hover:bg-blue-600 shadow-lg shadow-blue-100 transition-all"
                >
                  수정 완료
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
