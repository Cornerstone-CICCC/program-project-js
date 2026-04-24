"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react"; // ✅ 추가
import { cn } from "@/lib/utils"; // 위에서 만든 cn 함수
import { toast } from "react-hot-toast"; // 라이브러리 설치 필요
import moment from "moment";

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sharedItems, setSharedItems] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);

    // 세션 체크 중이면 대기
    if (status === "loading") return;

    // ✅ 로그인 안 되어 있으면 로그인 페이지로
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    const fetchData = async () => {
      try {
        // 1. 내 냉장고 재료 가져오기
        const ingRes = await fetch("/api/ingredients");

        if (ingRes.status === 401) {
          router.push("/auth/login");
          return;
        }

        if (ingRes.ok) {
          const ingData = await ingRes.json();
          setIngredients(Array.isArray(ingData) ? ingData : []);
          setIsCheckingAuth(false);
        } else {
          // 401 외의 에러 발생 시 처리
          console.error("Failed to load ingredients");
          setIsCheckingAuth(false);
        }

        // 2. 나눔 보드 아이템 가져오기 (인증과 별개로 로드 시도)
        try {
          const sharedRes = await fetch("/api/shared");
          if (sharedRes.ok) {
            const sharedData = await sharedRes.json();
            setSharedItems(Array.isArray(sharedData) ? sharedData : []);
          }
        } catch (sharedError) {
          console.error("Failed to load shared items:", sharedError);
          setSharedItems([]);
        }
      } catch (error) {
        console.error("Error occurred while loading data:", error);
        // 심각한 에러 발생 시 로그인 페이지로 이동하거나 에러 UI 표시
      }
    };

    fetchData();
  }, [status, router]); // ✅ status(로그인 상태)가 변경될 때마다 실행

  // 1. 클라이언트 사이드 렌더링 확인 전이거나 세션 정보를 불러오는 중일 때
  if (!isClient || status === "loading" || isCheckingAuth) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#fcfcfc",
        }}
      >
        <span style={{ fontSize: "50px", marginBottom: "20px" }}>🧊</span>
        <p style={{ color: "#6b7280", fontWeight: "600" }}>
          Checking your fridge...
        </p>
      </div>
    );
  }

  // 2. 로그인이 안 되어 있는 경우 (useEffect에서 리다이렉트하지만 안전장치로 추가)
  if (status === "unauthenticated") {
    return null;
  }

  // 1. 삭제 로직
  const deleteIngredient = async (id: string) => {
    if (!id) return;

    // 삭제 확인창(confirm)은 사용자 요청대로 삭제했습니다. 바로 실행됩니다.
    try {
      const response = await fetch(`/api/ingredients/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // 1. 상태 업데이트 (화면에서 즉시 제거)
        setIngredients((prev) =>
          prev.filter((item) => (item.id || item._id) !== id),
        );
        setEditingItem(null);

        // 2. 성공 토스트 알림
        toast.success("Ingredient deleted successfully! 🗑️");
      } else if (response.status === 404) {
        toast.error("Ingredient not found or unauthorized. (404)");
      } else {
        toast.error("Failed to delete the ingredient.");
      }
    } catch (error) {
      console.error("Delete request failed:", error);
      toast.error("An error occurred during deletion.");
    }
  };

  // 2. 수량 조절 (로컬 상태만 변경)
  const adjustQuantity = (amount: number) => {
    if (!editingItem) return;
    // 수량이 0 미만으로 내려가지 않게 소수점 첫째자리까지 반올림 처리 (부동소수점 오차 방지)
    const newQty = Math.max(
      0,
      Math.round((editingItem.quantity + amount) * 10) / 10,
    );
    setEditingItem({ ...editingItem, quantity: newQty });
  };

  // 3. 모달에서 "저장하기" 클릭 시 실행
  const handleSaveEdit = async () => {
    if (!editingItem) return;

    const targetId = editingItem.id || editingItem._id;

    try {
      const res = await fetch(`/api/ingredients/${targetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingItem.name,
          quantity: editingItem.quantity,
          unit: editingItem.unit,
          expiryDate: editingItem.expiryDate,
          memo: editingItem.memo,
          category: editingItem.category,
        }),
      });

      if (res.ok) {
        const updated = await res.json();

        setIngredients((prev) =>
          prev.map((ing) =>
            (ing.id || ing._id) === (updated.id || updated._id) ? updated : ing,
          ),
        );

        setEditingItem(null);
        toast.success("Changes saved successfully! ✨.");
      } else {
        const errorData = await res.json();
        toast.error(
          `Update failed: ${errorData.error || "Unknown error occurred"}`,
        );
      }
    } catch (error) {
      console.error("Failed to update:", error);
    }
  };

  return (
    <div
      style={{
        padding: "40px 20px 100px 20px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        color: "#111", // 약간 더 전문적인 딥블랙
        backgroundColor: "#fcfcfc",
        minHeight: "100vh",
      }}
    >
      {/* 상단 로그아웃 */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "10px",
        }}
      >
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          style={{
            fontSize: "12px",
            color: "#6b7280",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          Logout ({session?.user?.name || "User"})
        </button>
      </div>

      <h1
        style={{
          fontSize: "28px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontWeight: "800",
        }}
      >
        <span>🧊</span> My Fridge
      </h1>

      {/* 액션 버튼 그룹 */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
        {/* 1. 재료 추가 버튼 */}
        <Link
          href="/add"
          style={{
            flex: 1, // 버튼 너비를 균등하게 배분
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "14px 20px",
            backgroundColor: "#ffffff",
            color: "#2563eb",
            borderRadius: "16px",
            textDecoration: "none",
            fontWeight: "800",
            border: "2px solid #eff6ff",
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.03)",
            fontSize: "14px",
            transition: "all 0.2s ease",
          }}
        >
          + Add ingredient
        </Link>

        {/* 2. AI 큐레이션 버튼 (자동 생성 트리거) */}
        <Link
          href="/recipe?autoGenerate=true" // ✅ 쿼리 파라미터를 넘겨 자동 실행 신호를 줍니다.
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "14px 20px",
            backgroundColor: "#2563eb",
            color: "white",
            borderRadius: "16px",
            textDecoration: "none",
            fontWeight: "800",
            boxShadow: "0 8px 16px rgba(37, 99, 235, 0.2)",
            fontSize: "14px",
            transition: "all 0.2s ease",
          }}
        >
          <span>✨</span> Chef AI Curation
        </Link>
      </div>

      {/* 내 냉장고 목록 섹션 (인라인 스타일 그대로 유지) */}
      <section style={{ marginBottom: "40px" }}>
        <h3
          style={{
            fontSize: "18px",
            fontWeight: "700",
            marginBottom: "15px",
            color: "#6b7280",
          }}
        >
          My Fridge ({ingredients.length})
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {isClient && ingredients.length > 0 ? (
            ingredients.map((item: any) => {
              // 1. 날짜 및 상태 계산 로직
              const expiryDate = item.expiryDate
                ? new Date(item.expiryDate)
                : new Date();
              const diffDays = Math.ceil(
                (expiryDate.getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24),
              );
              const isUrgent = diffDays <= 3 && diffDays >= 0;
              const isExpired = diffDays < 0;

              // 2. 반드시 return 문이 있어야 UI가 렌더링됩니다.
              return (
                <div
                  key={item.id || item._id}
                  onClick={() => setEditingItem(item)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "15px",
                    backgroundColor: "white",
                    borderRadius: "16px",
                    cursor: "pointer",
                    border: isUrgent
                      ? "2px solid #fef3c7"
                      : isExpired
                        ? "2px solid #fee2e2"
                        : "1px solid #f3f4f6",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                    transition: "all 0.1s ease",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.transform = "scale(1.01)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span style={{ fontSize: "24px" }}>
                      {item.emoji || "🥬"}
                    </span>
                    <div>
                      <div style={{ fontWeight: "700", fontSize: "15px" }}>
                        {item.name}
                        <span
                          style={{
                            fontSize: "13px",
                            color: "#6b7280",
                            marginLeft: "6px",
                            fontWeight: "400",
                          }}
                        >
                          {item.quantity}
                          {item.unit}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: isExpired
                            ? "#ef4444"
                            : isUrgent
                              ? "#d97706"
                              : "#3b82f6",
                          fontWeight: "600",
                        }}
                      >
                        Exp:{" "}
                        {moment(new Date(item.expiryDate)).format(
                          "MMMM D, YYYY",
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {isUrgent && (
                      <span
                        style={{
                          fontSize: "10px",
                          backgroundColor: "#fffbeb",
                          color: "#d97706",
                          padding: "2px 8px",
                          borderRadius: "10px",
                          fontWeight: "800",
                        }}
                      >
                        URGENT
                      </span>
                    )}
                    {isExpired && (
                      <span
                        style={{
                          fontSize: "10px",
                          backgroundColor: "#fee2e2",
                          color: "#ef4444",
                          padding: "2px 8px",
                          borderRadius: "10px",
                          fontWeight: "800",
                        }}
                      >
                        EXPIRED
                      </span>
                    )}
                    <span style={{ color: "#d1d5db", fontSize: "18px" }}>
                      ›
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#9ca3af",
                border: "1px dashed #e5e7eb",
                borderRadius: "24px",
                backgroundColor: "#f9fafb",
              }}
            >
              <div style={{ fontSize: "30px", marginBottom: "10px" }}>
                Empty
              </div>
              <p style={{ fontSize: "14px" }}>Your fridge is empty.</p>
            </div>
          )}
        </div>
      </section>

      {/* 나눔 게시판 섹션 */}
      <section style={{ marginBottom: "40px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#6b7280" }}>
            Shared Board
          </h3>
          <Link
            href="/shared"
            style={{
              textDecoration: "none",
              fontSize: "13px",
              color: "#10b981",
              fontWeight: "600",
            }}
          >
            View All
          </Link>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px",
          }}
        >
          {sharedItems.length > 0 ? (
            sharedItems.map((item: any) => (
              <Link
                key={item.id}
                href={`/shared/${item.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "20px 15px", // 상하 패딩을 조금 더 주어 여유 있게 조절
                    borderRadius: "24px",
                    border: "1px solid #f3f4f6",
                    textAlign: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                    display: "flex", // 카드 내부 요소 수직 정렬을 위해 추가
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      marginBottom: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden", // 이미지가 삐져나오지 않게 처리
                      borderRadius: "16px", // 이미지 박스 자체의 곡률
                      backgroundColor: "#f9fafb", // 이미지 로딩 전이나 없을 때 대비한 배경색
                      margin: "0 auto", // ✅ 부모 컨테이너 내에서 가로 중앙 정렬
                    }}
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block", // 하단 공백 제거
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: "28px" }}>📸</span>
                    )}
                  </div>
                  <div style={{ fontWeight: "700", fontSize: "15px" }}>
                    {item.name}
                    {item.memo && (
                      <span
                        style={{
                          marginLeft: "6px",
                          fontSize: "12px",
                          verticalAlign: "middle",
                        }}
                        title={item.memo}
                      >
                        📝
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#6b7280",
                        marginLeft: "6px",
                        fontWeight: "400",
                      }}
                    >
                      {item.quantity}
                      {item.unit}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      backgroundColor:
                        item.status === "free" ? "#dcfce7" : "#dbeafe",
                      color: item.status === "free" ? "#059669" : "#2563eb",
                      fontSize: "10px",
                      fontWeight: "800",
                      padding: "2px 8px",
                      borderRadius: "8px",
                      textTransform: "uppercase",
                    }}
                  >
                    {item.status}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div
              style={{
                gridColumn: "span 2",
                padding: "30px",
                textAlign: "center",
                color: "#9ca3af",
                border: "1px dashed #e5e7eb",
                borderRadius: "20px",
              }}
            >
              No items shared yet.
            </div>
          )}
        </div>
      </section>

      {/* --- 🔴 프로페셔널 & 컴팩트 모달 🔴 --- */}
      {editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setEditingItem(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
          }}
        >
          <div
            className="w-full max-w-sm bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 - 고급스러운 그레이/오렌지 포인트 */}
            <div className="bg-blue-50/70 px-6 py-5 border-b border-blue-100/60 flex justify-between items-center">
              <h2 className="text-lg font-black text-gray-800 flex items-center gap-3">
                <span className="text-3xl">{editingItem.emoji || "✏️"}</span>
                Edit Ingredient Info
              </h2>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 hover:bg-white rounded-full transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* 모달 본문 - 컴팩트 레이아웃 */}
            <div className="p-7 space-y-5">
              {/* 재료 이름 - 한 줄 */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                  Item Name
                </label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-semibold"
                />
              </div>

              {/* 그리드 배치: 수량 조절 & 유통기한 */}
              <div className="grid grid-cols-2 gap-4 items-end">
                {/* 수량 조절 */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                    Amount
                  </label>
                  <div className="flex items-center justify-between gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-100 h-[52px]">
                    <button
                      onClick={() => adjustQuantity(-0.5)}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-blue-500 font-bold hover:bg-blue-500 hover:text-white transition-all"
                    >
                      -
                    </button>
                    <div className="flex-1 text-center font-black text-lg text-gray-700">
                      {editingItem.quantity}{" "}
                      <span className="text-sm font-normal text-gray-400">
                        {editingItem.unit}
                      </span>
                    </div>
                    <button
                      onClick={() => adjustQuantity(0.5)}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-blue-500 font-bold hover:bg-blue-500 hover:text-white transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 유통기한 */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                    Expired date
                  </label>
                  <input
                    type="date"
                    value={
                      editingItem.expiryDate
                        ? new Date(editingItem.expiryDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        expiryDate: new Date(e.target.value),
                      })
                    }
                    className="w-full px-4 h-[52px] py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              {/* 메모 - 한 줄 */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                  Memo
                </label>
                <textarea
                  placeholder="Add storage tips or special notes here."
                  value={editingItem.memo || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, memo: e.target.value })
                  }
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none text-sm leading-relaxed"
                />
              </div>
            </div>

            {/* 모달 푸터 - 세련된 버튼 배치 */}
            <div className="p-7 pt-0 flex flex-col items-center gap-2">
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-3.5 bg-gray-100 text-gray-500 font-bold rounded-xl hover:bg-gray-200"
                >
                  Canceled
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 py-3.5 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all shadow-md shadow-blue-100"
                >
                  Save
                </button>
              </div>

              <button
                onClick={() =>
                  deleteIngredient(editingItem.id || editingItem._id)
                }
                className="py-2.5 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
              >
                Remove from fridge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Styles (HomePage 함수 바깥에 정의) ---

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.4)", // 배경을 약간 어둡게
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999, // 최상단에 보이도록
  backdropFilter: "blur(4px)", // 배경 흐림 효과 (선택)
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: "white",
  padding: "30px",
  borderRadius: "24px",
  width: "90%",
  maxWidth: "400px",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  display: "flex",
  flexDirection: "column",
};

const labelStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#6b7280",
  marginBottom: "8px",
  display: "block",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  fontSize: "16px",
  marginBottom: "20px",
  outline: "none",
  boxSizing: "border-box",
};

const qtyBtnStyle: React.CSSProperties = {
  padding: "10px 15px",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  backgroundColor: "#f9fafb",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
  transition: "all 0.2s",
};

const saveBtnStyle: React.CSSProperties = {
  flex: 2,
  padding: "16px",
  backgroundColor: "#3b82f6",
  color: "white",
  border: "none",
  borderRadius: "14px",
  fontSize: "16px",
  fontWeight: "700",
  cursor: "pointer",
};

const cancelBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: "16px",
  backgroundColor: "#f3f4f6",
  color: "#4b5563",
  border: "none",
  borderRadius: "14px",
  fontSize: "16px",
  fontWeight: "600",
  cursor: "pointer",
};

const deleteBtnStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  backgroundColor: "transparent",
  color: "#ef4444",
  border: "none",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  marginTop: "10px",
  textDecoration: "underline",
};
