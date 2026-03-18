import { useEffect, useState } from "react"; // useEffect 추가
import { ArrowLeft, MapPin, Filter, Search } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { BottomNav } from "../components/BottomNav";
import { shareService } from "../services/shareService"; // 서비스 임포트

export function ShareBoard() {
  const { ingredients, loading, error } = useIngredients();

  // --- 1. 상태 관리 추가 ---
  const [items, setItems] = useState<any[]>([]); // 서버에서 받아올 아이템들
  const [loading, setLoading] = useState(true);

  // --- 2. 데이터 가져오기 (useEffect) ---
  useEffect(() => {
    const fetchSharedPosts = async () => {
      try {
        setLoading(true);
        const data = await shareService.getAll();
        setItems(data);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSharedPosts();
  }, []);

  // --- 3. 필터링 로직 (status는 이제 백엔드 필드인 pickup_type과 매칭) ---
  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    // 백엔드 pickup_type: "Free" 또는 "Pickup" (대소문자 주의)
    return item.pickup_type?.toLowerCase() === filter;
  });

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="bg-card px-6 py-4 border-b border-border shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/ingredients">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="cursor-pointer rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>

            <h1 className="text-2xl">Shared Items</h1>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-[#1d7d5e]/10 px-3 py-2 text-[#1d7d5e]">
            <Share2 className="h-4 w-4" />
            <span className="text-sm">{sharedItems.length} shared</span>
          </div>
        </div>

        <p className="text-muted-foreground">
          Manage items you have shared with others
        </p>
      </div>

      <div className="space-y-4 p-6">
        {loading ? (
          <p className="text-muted-foreground">Loading shared items...</p>
        ) : error ? (
          <p className="text-destructive">{error}</p>
        ) : sharedItems.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
            <p className="text-muted-foreground">No shared items yet.</p>
          </div>
        ) : (
          sharedItems.map((item) => {
            const daysLeft = getDaysUntilExpiration(item.expirationDate);
            const ddayLabel = getDdayLabel(daysLeft);

            return (
              <Link
                key={item.id}
                to={`/ingredients/${item.id}`}
                className="block"
              >
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <p className="font-medium">{item.name}</p>
                        <Badge className="bg-[#1d7d5e]/10 text-[#1d7d5e]">
                          Shared
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {item.storeName || "Unknown store"}
                      </p>
                    </div>

                    <div className="space-y-1 text-right">
                      {item.expirationDate && (
                        <Badge
                          variant="secondary"
                          className="bg-[#1d7d5e]/10 text-[#1d7d5e]"
                        >
                          {item.expirationDate}
                        </Badge>
                      )}

        {/* Shared Items Grid */}
        <div className="grid grid-cols-2 gap-4">
          {loading ? (
            <p className="col-span-2 text-center py-10">
              Loading shared items...
            </p>
          ) : filteredItems.length === 0 ? (
            <p className="col-span-2 text-center py-10 text-muted-foreground">
              No items found.
            </p>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item._id} // MongoDB의 _id 사용
                className="bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow"
                onClick={() => navigate(`/share/${item._id}`)} // 상세 페이지 이동용
              >
                {/* 🔴 이미지 처리: URL이 있으면 img 태그, 없으면 기본 아이콘 */}
                <div className="w-full h-24 bg-secondary/30 rounded-xl flex items-center justify-center overflow-hidden mb-3">
                  {item.photo_url ? (
                    <img
                      src={item.photo_url}
                      alt={item.ingredient_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">📦</span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium truncate">
                      {item.ingredient_name}
                    </h3>

                    <Badge
                      variant={
                        item.pickup_type === "Free" ? "default" : "secondary"
                      }
                      className={`text-[10px] px-2 rounded-full ${
                        item.pickup_type === "Free"
                          ? "bg-primary/20 text-primary"
                          : "bg-accent/20 text-accent"
                      }`}
                    >
                      {item.pickup_type}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {/* 수량 데이터가 모델에 있다면 표시, 없으면 description 일부 표시 */}
                    {item.description || "No description"}
                  </p>

                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1">
                      <span>👤</span>
                      {/* 백엔드에서 populate("user_id", "name") 했을 경우 */}
                      <span className="truncate">
                        From: {item.user_id?.name || "Unknown"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{item.distance || "Near you"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Item Button: 클릭 시 등록 페이지 이동 */}
        <Button
          className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg"
          onClick={() => navigate("/share/add")}
        >
          <span className="text-2xl">+</span>
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
