import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, User, Calendar } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { shareService } from "../services/shareService";

export function ShareDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // 현재 로그인한 사용자 ID (localStorage에 저장되어 있다고 가정)
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const res = await shareService.getById(id);
        setData(res); // { post, comments } 구조
      } catch (error) {
        console.error("Failed to fetch detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleStatusChange = async () => {
    if (!id || !window.confirm("나눔을 완료 처리하시겠습니까?")) return;

    try {
      setIsUpdating(true);
      await shareService.updateStatus(id, "completed");
      alert("나눔 완료! 리스트에서 확인하세요. 🎉");
      navigate("/share");
    } catch (error) {
      alert("상태 변경에 실패했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!data?.post)
    return <div className="p-10 text-center">Post not found.</div>;

  const { post } = data;
  // 본인 확인 (ID 비교)
  const isOwner =
    post.user_id._id === currentUserId || post.user_id === currentUserId;

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-medium">Details</h1>
      </div>

      {/* Image Section */}
      <div className="w-full h-72 bg-secondary/20 relative">
        {post.photo_url ? (
          <img
            src={post.photo_url}
            className="w-full h-full object-cover"
            alt="food"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            📦
          </div>
        )}
        {post.status === "completed" && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-black px-6 py-2 rounded-full font-bold text-lg">
              COMPLETED
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="px-6 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{post.ingredient_name}</h2>
          <Badge
            className={
              post.status === "completed" ? "bg-gray-400" : "bg-[#1d7d5e]"
            }
          >
            {post.status === "completed" ? "Done" : post.pickup_type}
          </Badge>
        </div>

        <div className="space-y-3 text-muted-foreground">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4" />{" "}
            <span>Shared by: {post.user_id?.name || "User"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4" />{" "}
            <span>
              Expires:{" "}
              {post.ingredient_id?.expiration_date?.split("T")[0] || "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4" /> <span>Location: Near you</span>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-gray-600 leading-relaxed">
            {post.description || "No description provided."}
          </p>
        </div>
      </div>

      {/* 🔴 나눔 완료 버튼 (작성자이고 아직 진행 중일 때만 표시) */}
      {isOwner && post.status !== "completed" && (
        <div className="fixed inset-x-0 bottom-6 px-6">
          <Button
            onClick={handleStatusChange}
            disabled={isUpdating}
            className="w-full bg-[#1d7d5e] hover:bg-[#17664c] text-white py-7 rounded-2xl text-lg font-bold shadow-xl"
          >
            {isUpdating ? "Updating..." : "Mark as Completed"}
          </Button>
        </div>
      )}
    </div>
  );
}
