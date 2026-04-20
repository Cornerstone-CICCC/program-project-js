"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // 세션 정보 가져오기
import toast from "react-hot-toast"; // ✅ 라이브러리 임포트

export default function SharedItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { data: session } = useSession();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isToastOpen, setIsToastOpen] = useState(false); // ✅ Toast 상태 관리
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);

  // 현재 접속자가 게시글 주인인지 확인
  const isOwner = session?.user?.id === item?.userId;

  const fetchItem = async () => {
    try {
      const res = await fetch(`/api/shared/${id}`);
      if (res.ok) {
        const data = await res.json();
        setItem(data);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    if (!session) {
      toast.error("Please log in to continue.");
      return;
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId: item.userId, // 게시글 작성자 ID
          itemId: item.id, // 현재 아이템 ID (sharedItemId)
        }),
      });

      if (res.ok) {
        const chat = await res.json();
        // 생성 혹은 조회된 채팅방 ID로 이동
        router.push(`/chat/${chat.id}`);
      } else {
        const errorData = await res.text();
        toast.error(errorData || "Failed to connect to chat");
      }
    } catch (error) {
      toast.error("An error occurred during connection.");
    }
  };

  // 2. useEffect에서 호출
  useEffect(() => {
    fetchItem();
  }, [id]); // id가 변경될 때마다 실행

  // 🗑️ 삭제 로직
  const handleDelete = async () => {
    setIsToastOpen(false); // 바텀 시트 닫기
    setIsDeleteConfirm(false); // 확인 상태 초기화

    const deletePromise = fetch(`/api/shared/${id}`, { method: "DELETE" });

    toast.promise(deletePromise, {
      loading: "Deleting your post...",
      success: () => {
        setTimeout(() => {
          router.push("/shared");
          router.refresh();
        }, 1000);
        return "Successfully deleted 🍊";
      },
      error: "Failed to delete.",
    });
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "100px", fontWeight: "700" }}>
        Loading data...
      </div>
    );
  if (!item)
    return (
      <div style={{ textAlign: "center", padding: "100px", fontWeight: "700" }}>
        Item not found
      </div>
    );

  const formattedExpiry = item.expiryDate
    ? new Date(item.expiryDate).toLocaleDateString()
    : "No Info";

  return (
    <div
      style={{
        padding: "40px 24px 120px 24px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        color: "#1f2937",
        backgroundColor: "#fcfcfc",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      {/* 상단 네비게이션 바 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            background: "white",
            border: "1px solid #f3f4f6",
            width: "40px",
            height: "40px",
            borderRadius: "14px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            color: "#9ca3af",
            boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* ✅ 조건 1: 내가 올린 아이템일 때만 '더보기' 버튼 표시 */}
        {isOwner && (
          <button
            onClick={() => setIsToastOpen(true)}
            style={{
              border: "none",
              background: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#6b7280",
            }}
          >
            ⋮
          </button>
        )}
      </div>

      {/* 이미지 영역 */}
      <div
        style={{
          width: "100%",
          height: "340px",
          borderRadius: "32px",
          overflow: "hidden",
          backgroundColor: "#fff7ed",
          marginBottom: "30px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
        }}
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ fontSize: "100px" }}>📦</div>
        )}
      </div>

      {/* 아이템 기본 정보 */}
      <div style={{ marginBottom: "32px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "900",
              margin: 0,
              letterSpacing: "-0.025em",
            }}
          >
            {item.name}
          </h1>
          <div
            style={{
              backgroundColor: item.status === "free" ? "#ecfdf5" : "#eff6ff",
              color: item.status === "free" ? "#059669" : "#2563eb",
              padding: "8px 16px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: "900",
              textTransform: "uppercase",
            }}
          >
            {item.status}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#6b7280",
            fontSize: "15px",
            fontWeight: "600",
          }}
        >
          <span style={{ fontSize: "18px" }}>📍</span>
          <span style={{ color: "#f97316", fontWeight: "800" }}>
            {" "}
            Within 300m{" "}
          </span>
          <span style={{ color: "#e5e7eb", margin: "0 4px" }}>|</span>
          <span>Expiry: {formattedExpiry}</span>
        </div>
      </div>

      {/* 작성자 프로필 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "20px",
          borderRadius: "24px",
          backgroundColor: "white",
          border: "1px solid #f3f4f6",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "18px",
            backgroundColor: "#f3f4f6",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "24px",
          }}
        >
          👤
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{ fontSize: "16px", fontWeight: "800", color: "#1f2937" }}
          >
            {item.owner
              ? `${item.owner.firstName}${item.owner.lastName}`
              : "Neighbor"}
          </div>
          <div
            style={{ fontSize: "13px", color: "#9ca3af", fontWeight: "600" }}
          >
            ⭐ 5.0 · {item.owner?.location || "Local Resident"}
          </div>
        </div>
        <div
          style={{
            fontSize: "13px",
            color: "#f97316",
            fontWeight: "800",
            cursor: "pointer",
          }}
        >
          View Profile
        </div>
      </div>

      {/* 상세 설명 */}
      <div style={{ marginBottom: "40px", padding: "0 4px" }}>
        <h3
          style={{
            fontSize: "18px",
            fontWeight: "800",
            marginBottom: "12px",
            color: "#1f2937",
          }}
        >
          Item Details
        </h3>
        <p
          style={{
            color: "#4b5563",
            lineHeight: "1.7",
            margin: 0,
            fontSize: "16px",
            fontWeight: "500",
          }}
        >
          {item.description || "No description provided."}
        </p>
      </div>

      {!isOwner && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            width: "100%",
            maxWidth: "600px",
            padding: "20px 24px 30px",
            backgroundColor: "white",
            borderTop: "1px solid #f3f4f6",
            zIndex: 10,
          }}
        >
          <button
            onClick={handleChat}
            style={{
              width: "100%",
              padding: "20px",
              borderRadius: "20px",
              backgroundColor: "#f97316",
              color: "white",
              border: "none",
              fontWeight: "900",
              fontSize: "18px",
              cursor: "pointer",
              boxShadow: "0 10px 20px rgba(249, 115, 22, 0.2)",
            }}
          >
            Chat 💬
          </button>
        </div>
      )}

      {/* --- ✅ Toast(Bottom Sheet) 메뉴 --- */}
      {isToastOpen && isOwner && (
        <>
          {/* 어두운 배경 (클릭 시 닫힘) */}
          <div
            onClick={() => setIsToastOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 999,
              backdropFilter: "blur(2px)", // 배경을 살짝 흐리게 하면 더 고급스러워요
            }}
          />

          {/* 바텀 시트 본체 */}
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              maxWidth: "600px",
              backgroundColor: "white",
              borderTopLeftRadius: "32px",
              borderTopRightRadius: "32px",
              padding: "20px 24px 40px 24px",
              zIndex: 1000,
              animation: "slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // 더 부드러운 애니메이션
              boxShadow: "0 -10px 40px rgba(0,0,0,0.1)",
            }}
          >
            {/* 상단 핸들 (모바일 UI 느낌) */}
            <div
              style={{
                width: "40px",
                height: "4px",
                backgroundColor: "#e5e7eb",
                borderRadius: "2px",
                margin: "0 auto 24px auto",
              }}
            />

            {/* 수정 버튼 */}
            <button
              onClick={() => {
                setIsToastOpen(false);
                router.push(`/shared/edit/${id}`);
              }}
              style={{
                width: "100%",
                padding: "18px",
                borderRadius: "20px",
                border: "none",
                backgroundColor: "#f9fafb",
                color: "#1f2937",
                fontSize: "16px",
                fontWeight: "800",
                marginBottom: "12px",
                cursor: "pointer",
              }}
            >
              Edit
            </button>

            {/* 삭제 버튼 (붉은색 강조) */}
            <button
              onClick={handleDelete}
              style={{
                width: "100%",
                padding: "18px",
                borderRadius: "20px",
                border: "none",
                backgroundColor: "#fff1f2",
                color: "#ef4444",
                fontSize: "16px",
                fontWeight: "800",
                cursor: "pointer",
              }}
            >
              Remove
            </button>

            {/* 취소 버튼 */}
            <button
              onClick={() => setIsToastOpen(false)}
              style={{
                width: "100%",
                marginTop: "12px",
                padding: "18px",
                border: "none",
                background: "none",
                color: "#9ca3af",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Canceled
            </button>
          </div>
        </>
      )}

      {/* 애니메이션 효과 */}
      <style jsx global>{`
        @keyframes slideUp {
          from {
            transform: translate(-50%, 100%);
          }
          to {
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  );
}
