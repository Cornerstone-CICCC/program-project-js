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
  const [typeFilter, setTypeFilter] = useState<"all" | "free" | "pickup">(
    "all",
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "available" | "completed"
  >("available");

  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredItems = items.filter((item) => {
    // 1. 나눔 방식 필터 (Free / Pickup)
    const matchesType =
      typeFilter === "all" || item.pickup_type?.toLowerCase() === typeFilter;

    // 2. 나눔 상태 필터 (Available / Completed)
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    // 3. 🟢 검색어 필터 (제목에 검색어가 포함되어 있는지 확인)
    const matchesSearch = item.ingredient_name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesType && matchesStatus && matchesSearch; // 🟢 세 조건 모두 만족
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
            value={searchQuery} // 🟢 연결
            onChange={(e) => setSearchQuery(e.target.value)} // 🟢 입력 시 상태 업데이트
            className="w-full pl-12 pr-4 py-3 bg-input-background rounded-xl border-0 focus:ring-2 focus:ring-[#1d7d5e]"
          />
        </div>
      </div>

      <div className="px-6 py-4">
        {/* Filter Tabs Container */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {/* 🟢 1. 상태 필터 (Available / Completed) - 토글 버튼 스타일 */}
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setStatusFilter(statusFilter === "all" ? "available" : "all")
            }
            className={`rounded-full px-4 border-none transition-all ${
              statusFilter === "all"
                ? "bg-amber-100 text-amber-700 font-bold"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {statusFilter === "all" ? "Showing All" : "Hide Done"}
          </Button>
          <div className="w-[1px] h-4 bg-gray-300 mx-1" /> {/* 구분선 */}
          {/* 🟢 2. 방식 필터 (All / Free / Pickup) - 기존 setFilter 오류 수정 */}
          {[
            { id: "all", label: "Any Type" },
            { id: "free", label: "Free" },
            { id: "pickup", label: "Pickup" },
          ].map((tab) => (
            <Button
              key={tab.id}
              size="sm"
              variant="outline"
              // 🔴 여기서 setFilter 대신 setTypeFilter를 사용해야 합니다!
              onClick={() => setTypeFilter(tab.id as any)}
              className={`rounded-full px-5 py-1.5 transition-all duration-200 border-none ${
                typeFilter === tab.id
                  ? "bg-[#1d7d5e] text-white shadow-md hover:bg-[#17664c]"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            className="rounded-full ml-auto w-9 h-9 flex items-center justify-center border-gray-200 text-gray-500"
          >
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
                        From:{" "}
                        {
                          // 1. fullName이 있는 경우 (객체인 경우)
                          item.user_id?.fullName ||
                            // 2. firstName과 lastName이 따로 있는 경우
                            (item.user_id?.firstName && item.user_id?.lastName
                              ? `${item.user_id.firstName} ${item.user_id.lastName}`
                              : typeof item.user_id === "string"
                                ? "Loading..."
                                : "User")
                        }
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
