"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddIngredientPage() {
  // --- 기존 상태 유지 및 추가 필드 ---
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("unit");
  const [expiryDate, setExpiryDate] = useState("");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 수량 조절 함수
  const adjustQuantity = (amount: number) => {
    setQuantity((prev) => Math.max(0, prev + amount));
  };

  // --- 기존 handleSubmit 로직 (누락 없음) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !expiryDate)
      return alert("Please enter the ingredient name and expiration date!");

    setLoading(true);
    try {
      const res = await fetch("/api/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 수정된 스키마에 맞춰 모든 데이터 전송
        body: JSON.stringify({ name, quantity, unit, expiryDate, memo }),
      });

      if (res.ok) {
        router.refresh();
        setTimeout(() => {
          router.push("/");
        }, 100);
      } else {
        alert("Failed to save.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] p-6 flex flex-col items-center font-sans">
      {/* 뒤로가기 버튼 */}
      <div className="w-full max-w-md flex justify-start mb-6">
        <Link
          href="/"
          className="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm font-semibold transition-colors"
        >
          ← Go back
        </Link>
      </div>

      {/* 메인 입력 카드 */}
      <div className="w-full max-w-md bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-50 overflow-hidden">
        {/* 카드 헤더 */}
        <div className="bg-orange-50/70 px-8 py-6 border-b border-orange-100/60">
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-3">
            <span className="text-3xl">🍎</span>
            Add New Ingredient
          </h1>
        </div>

        {/* 입력 폼 */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* 재료 이름 */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
              Ingredient Name
            </label>
            <input
              type="text"
              placeholder="e.g., apple, milk, meat"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all font-semibold placeholder:text-gray-300"
            />
          </div>

          {/* 수량 및 유통기한 (컴팩트 그리드) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Quantity / Unit
              </label>
              <div className="flex items-center justify-between gap-1 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 h-[58px]">
                <button
                  type="button"
                  onClick={() => adjustQuantity(-0.5)}
                  className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-orange-500 font-bold hover:bg-orange-500 hover:text-white transition-all"
                >
                  -
                </button>
                <div className="flex-1 text-center font-black text-gray-700">
                  {quantity}{" "}
                  <span className="text-[10px] font-normal text-gray-400">
                    {unit}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => adjustQuantity(0.5)}
                  className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-orange-500 font-bold hover:bg-orange-500 hover:text-white transition-all"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Expiration Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-4 h-[58px] bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium"
              />
            </div>
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
              Storage Memo
            </label>
            <textarea
              placeholder="Enter storage instructions or special notes."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none h-24 resize-none text-sm leading-relaxed"
            />
          </div>

          {/* 등록 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 text-white font-black rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] ${
              loading
                ? "bg-gray-300 shadow-none cursor-default"
                : "bg-orange-500 hover:bg-orange-600 shadow-orange-200"
            }`}
          >
            {loading ? "Saving..." : "Add to Fridge 🧊"}
          </button>
        </form>
      </div>

      <p className="mt-8 text-gray-400 text-[11px] font-medium tracking-tight">
        Accurate expiration date entry is the start of fresh cooking!
      </p>
    </div>
  );
}
