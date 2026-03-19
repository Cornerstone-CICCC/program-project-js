import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  User,
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { shareService } from "../services/shareService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-me"; // 👈 'dropdown-me'에서 'dropdown-menu'로 수정 확인!

export function ShareDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOwner, setIsOwner] = useState(false); // 🟢 1. 상태 변수로 사용

  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const res = await shareService.getById(id);
        setData(res);
        setComments(res.comments || []); // 🟢 백엔드에서 준 댓글 데이터 저장

        // 🟢 2. 본인 확인 로직
        const storedUserId = localStorage.getItem("userId");
        const postOwnerId = res.post.user_id?._id || res.post.user_id;

        if (
          storedUserId &&
          postOwnerId &&
          String(storedUserId) === String(postOwnerId)
        ) {
          setIsOwner(true);
        } else {
          setIsOwner(false);
        }
      } catch (error) {
        console.error("Failed to fetch detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !id) return;
    try {
      setIsSubmitting(true);
      // shareService에 addComment 함수가 있다고 가정 (없다면 추가 필요)
      const res = await shareService.addComment(id, { content: newComment });
      setComments([res, ...comments]); // 새 댓글을 맨 위로 추가
      setNewComment(""); // 입력창 비우기
    } catch (error) {
      alert("댓글 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm("정말 이 게시글을 삭제하시겠습니까?")) return;
    try {
      await shareService.delete(id);
      alert("삭제되었습니다.");
      navigate("/share");
    } catch (error) {
      console.error(error);
      alert("삭제에 실패했습니다.");
    }
  };

  const handleStatusChange = async () => {
    if (!id || !window.confirm("나눔을 완료 처리하시겠습니까?")) return;
    try {
      setIsUpdating(true);
      await shareService.updateStatus(id, "completed");
      alert("나눔 완료! 🎉");
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

  // 🔴 삭제된 줄: const isOwner = ... (중복 선언 에러의 원인)

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-medium">Details</h1>
        </div>

        {/* 본인인 경우에만 드롭다운 표시 */}
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 rounded-xl bg-white shadow-lg border"
            >
              <DropdownMenuItem
                onClick={() => navigate(`/share/${id}/edit`)} // 👈 App.tsx 경로와 일치 확인
                className="cursor-pointer py-3"
              >
                <Edit2 className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleDelete}
                variant="destructive"
                className="cursor-pointer py-3"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
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
            <User className="w-4 h-4" />
            <span>
              Shared by:{" "}
              {post.user_id?.fullName ||
                `${post.user_id?.firstName || ""} ${post.user_id?.lastName || ""}`.trim() ||
                "User"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4" />
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
        {/* 🟢 여기에 댓글 섹션 삽입 (4번 JSX 내용) */}
        <div className="pt-6 border-t space-y-4">
          <h3 className="font-semibold text-lg">
            Comments ({comments.length})
          </h3>

          {/* 댓글 입력창 */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d7d5e]"
            />
            <Button
              onClick={handleAddComment}
              disabled={isSubmitting}
              className="bg-[#1d7d5e] text-white rounded-xl px-4"
            >
              {isSubmitting ? "..." : "Send"}
            </Button>
          </div>

          {/* 댓글 목록 */}
          <div className="space-y-4 mt-6">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div
                  key={comment._id}
                  className="flex gap-3 bg-gray-50 p-4 rounded-2xl"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                    👤
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-bold">
                        {/* 백엔드 수정으로 fullName이 나옵니다 */}
                        {comment.user_id?.fullName || "User"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-10">
                No comments yet. Be the first to ask!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Button */}
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
