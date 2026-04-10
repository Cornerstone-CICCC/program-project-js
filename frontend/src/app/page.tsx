"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react"; // ✅ 추가

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
          console.error("재료 로드 실패");
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
          console.error("나눔 목록 로드 실패 (무시하고 진행):", sharedError);
          setSharedItems([]);
        }
      } catch (error) {
        console.error("데이터 로드 중 에러 발생:", error);
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
        <p style={{ color: "#6b7280", fontWeight: "600" }}>냉장고 확인 중...</p>
      </div>
    );
  }

  // 2. 로그인이 안 되어 있는 경우 (useEffect에서 리다이렉트하지만 안전장치로 추가)
  if (status === "unauthenticated") {
    return null;
  }

  // 1. 삭제 로직
  const deleteIngredient = async (id: string) => {
    if (!confirm("정말 이 재료를 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/ingredients/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setIngredients((prev) => prev.filter((item) => item.id !== id));
        setEditingItem(null); // 삭제 후 모달 닫기
      } else {
        alert("삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Delete request failed:", error);
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

    try {
      const res = await fetch(`/api/ingredients/${editingItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingItem.name,
          quantity: editingItem.quantity,
          unit: editingItem.unit,
          expiryDate: editingItem.expiryDate,
          emoji: editingItem.emoji,
          memo: editingItem.memo, // ✅ 이미 정의된 memo 필드 추가
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setIngredients(
          ingredients.map((ing) => (ing.id === updated.id ? updated : ing)),
        );
        setEditingItem(null);
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
        color: "#333",
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
          onClick={() => signOut({ callbackUrl: "/auth/login" })} // ✅ 실제 로그아웃 기능 연결
          style={{
            fontSize: "12px",
            color: "#6b7280",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          로그아웃 ({session?.user?.name || "User"})
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
        <span>🧊</span> 내 냉장고
      </h1>

      {/* 액션 버튼 그룹 - AI 버튼 제거됨 */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
        <Link
          href="/add"
          style={{
            padding: "12px 20px",
            backgroundColor: "#3b82f6",
            color: "white",
            borderRadius: "12px",
            textDecoration: "none",
            fontWeight: "bold",
            boxShadow: "0 2px 4px rgba(59, 130, 246, 0.2)",
            fontSize: "14px",
          }}
        >
          + 재료 추가
        </Link>
      </div>

      {/* 내 냉장고 목록 섹션 */}
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
                  key={item.id}
                  onClick={() => setEditingItem(item)} // 클릭 시 편집 모달 오픈
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
                  {/* 왼쪽: 이콘 및 정보 */}
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
                        Exp: {expiryDate.toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* 오른쪽: 상태 라벨 및 화살표 */}
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
            /* 데이터가 없을 때 표시되는 UI */
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
              <p style={{ fontSize: "14px" }}>냉장고가 비어있습니다.</p>
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
                    padding: "15px",
                    borderRadius: "20px",
                    border: "1px solid #f3f4f6",
                    textAlign: "center",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
                  }}
                >
                  <div style={{ fontSize: "32px", marginBottom: "10px" }}>
                    {item.imageUrl
                      ? "📸"
                      : item.name?.toLowerCase().includes("apple")
                        ? "🍎"
                        : item.name?.toLowerCase().includes("milk")
                          ? "🥛"
                          : "📦"}
                  </div>
                  <div style={{ fontWeight: "700", fontSize: "15px" }}>
                    {item.name}
                    {/* 메모가 있으면 작은 아이콘 표시 */}
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
              등록된 나눔 아이템이 없습니다.
            </div>
          )}
        </div>
      </section>

      {/* 🔴 [추가됨] 4. 편집 모달 영역 🔴 */}
      {editingItem && (
        <div style={modalOverlayStyle} onClick={() => setEditingItem(null)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: "20px", fontSize: "20px" }}>
              재료 수정 ✏️
            </h2>

            <label style={labelStyle}>재료 이름</label>
            <input
              style={inputStyle}
              value={editingItem.name}
              onChange={(e) =>
                setEditingItem({ ...editingItem, name: e.target.value })
              }
            />

            <label style={labelStyle}>수량 조절</label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "25px",
              }}
            >
              <button style={qtyBtnStyle} onClick={() => adjustQuantity(-0.5)}>
                -0.5
              </button>
              <span style={{ fontSize: "18px", fontWeight: "800" }}>
                {editingItem.quantity} {editingItem.unit}
              </span>
              <button style={qtyBtnStyle} onClick={() => adjustQuantity(0.5)}>
                +0.5
              </button>
            </div>

            <label style={labelStyle}>유통기한</label>
            <input
              type="date"
              style={{
                ...inputStyle,
                marginBottom: "20px",
              }}
              // 날짜 형식을 YYYY-MM-DD로 변환하여 value에 전달
              value={
                editingItem.expiryDate
                  ? new Date(editingItem.expiryDate).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  expiryDate: new Date(e.target.value),
                })
              }
            />

            <label style={labelStyle}>메모</label>
            <textarea
              style={{
                ...inputStyle, // 기존 input 스타일 재활용
                height: "100px",
                padding: "12px",
                fontSize: "14px",
                resize: "none", // 사용자 크기 조절 방지
                lineHeight: "1.5",
                marginBottom: "25px",
              }}
              placeholder="보관 방법이나 유의사항을 적어주세요."
              value={editingItem.memo || ""}
              onChange={(e) =>
                setEditingItem({ ...editingItem, memo: e.target.value })
              }
            />

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                style={cancelBtnStyle}
                onClick={() => setEditingItem(null)}
              >
                취소
              </button>
              <button style={saveBtnStyle} onClick={handleSaveEdit}>
                저장하기
              </button>
            </div>

            <button
              style={deleteBtnStyle}
              onClick={() => deleteIngredient(editingItem.id)}
            >
              이 재료 삭제하기
            </button>
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
          <NavItem icon="🏠" label="Home" active />
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
          <NavItem icon="👤" label="My" />
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
