import { useEffect, useState } from "react"; // useEffect 추가
import { ArrowLeft, MapPin, Filter, Search } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "../components/BottomNav";
import { shareService } from "../services/shareService"; // 서비스 임포트

export function ShareBoard() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "free" | "pickup">("all");

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
      {/* Header */}
      <div className="bg-card px-6 py-4 border-b border-border">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate("/ingredients")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <h1 className="text-xl">Shared Board</h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search ingredients..."
            className="w-full pl-12 pr-4 py-3 bg-input-background rounded-xl border-0"
          />
        </div>
      </div>

      <div className="px-6 py-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className={`rounded-full ${
              filter === "all" ? "bg-primary text-white" : ""
            }`}
          >
            Available
          </Button>

          <Button
            variant={filter === "free" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("free")}
            className={`rounded-full ${
              filter === "free" ? "bg-primary text-white" : ""
            }`}
          >
            Free
          </Button>

          <Button
            variant={filter === "pickup" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("pickup")}
            className={`rounded-full ${
              filter === "pickup" ? "bg-accent text-white" : ""
            }`}
          >
            Pickup
          </Button>

          <Button variant="outline" size="sm" className="rounded-full ml-auto">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

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
                key={item._id}
                // 🔴 1. 완료된 아이템은 흐릿하게(opacity-50) 보이고 흑백(grayscale) 처리합니다.
                className={`bg-card rounded-2xl p-4 border border-border shadow-sm transition-all 
          ${item.status === "completed" ? "opacity-60 grayscale cursor-default" : "hover:shadow-md cursor-pointer"}`}
                onClick={() =>
                  item.status !== "completed" && navigate(`/share/${item._id}`)
                }
              >
                <div className="relative w-full h-24 bg-secondary/30 rounded-xl flex items-center justify-center overflow-hidden mb-3">
                  {/* 🔴 2. 완료된 아이템 위에 "COMPLETED" 라벨 표시 */}
                  {item.status === "completed" && (
                    <div className="absolute inset-0 z-10 bg-black/40 flex items-center justify-center">
                      <span className="text-white font-bold text-xs border-2 border-white px-2 py-1 rounded-lg uppercase tracking-wider rotate-[-10deg]">
                        Completed
                      </span>
                    </div>
                  )}

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

                    {/* 🔴 3. 배지 색상도 상태에 따라 변경 */}
                    <Badge
                      variant={
                        item.status === "completed"
                          ? "secondary"
                          : item.pickup_type === "Free"
                            ? "default"
                            : "secondary"
                      }
                      className={`text-[10px] px-2 rounded-full ${
                        item.status === "completed"
                          ? "bg-gray-200 text-gray-500"
                          : item.pickup_type === "Free"
                            ? "bg-primary/20 text-primary"
                            : "bg-accent/20 text-accent"
                      }`}
                    >
                      {item.status === "completed" ? "Done" : item.pickup_type}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {item.description || "No description"}
                  </p>

                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1">
                      <span>👤</span>
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
