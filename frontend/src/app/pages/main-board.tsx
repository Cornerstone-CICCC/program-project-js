import { Link } from "react-router-dom";
import { Bell, Settings, Calendar, ChefHat, Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useIngredients } from "../hooks";
import { BottomNav } from "../components/BottomNav";
import { useEffect, useState, useMemo } from "react"; // useMemo 추가
import { shareService } from "../services/shareService";

function getDaysUntilExpiration(dateString?: string) {
  if (!dateString) return null;
  const today = new Date();
  const expiry = new Date(dateString);
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function MainBoard() {
  const { ingredients, loading, error, refresh } = useIngredients();
  const [sharedPosts, setSharedPosts] = useState<any[]>([]);
  const userName = localStorage.getItem("currentUserName") || "User";

  const categoryIcons: Record<string, string> = {
    vegetable: "🥬",
    fruit: "🍎",
    dairy: "🥛",
    meat: "🍖",
    seafood: "🐟",
    grain: "🌾",
    other: "📦",
    others: "📦", // 👈 'Others' 대응
    general: "📦", // 👈 콘솔에 찍히는 'General' 대응
  };

  const getCategoryIcon = (category: string) => {
    if (!category) return "📦";

    // 소문자로 바꾸고 공백 제거 (예: "General " -> "general")
    const cleanCategory = category.toLowerCase().trim();

    // 매핑 테이블에서 찾고, 없으면 기본값으로 상자(📦) 아이콘 반환
    return categoryIcons[cleanCategory] || "📦";
  };

  useEffect(() => {
    refresh();

    const fetchShared = async () => {
      try {
        const data = await shareService.getAll();
        setSharedPosts(data.slice(0, 2));
      } catch (e) {
        console.error(e);
      }
    };
    fetchShared();
  }, [refresh]);

  // --- 1. 데이터가 없을 때를 대비한 안전한 정렬 로직 ---
  const urgentItem = useMemo(() => {
    if (!ingredients || ingredients.length === 0) return null;
    return [...ingredients]
      .filter((i) => i.expiration_date)
      .sort(
        (a, b) =>
          new Date(a.expiration_date).getTime() -
          new Date(b.expiration_date).getTime(),
      )[0];
  }, [ingredients]);

  const urgentDays = urgentItem
    ? getDaysUntilExpiration(urgentItem.expiration_date)
    : null;

  // --- 2. 로딩 및 에러 상태 UI 처리 (데이터가 안 보일 때 원인 파악용) ---
  // if (loading)
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       Loading...
  //     </div>
  //   );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error: {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f8fffd] pb-28">
      {/* --- Header --- */}
      <div className="bg-white px-6 py-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Hello, <span className="text-[#56cc9d]">{userName}!</span> 👋
        </h1>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5 text-slate-400" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="h-5 w-5 text-slate-400" />
          </Button>
        </div>
      </div>

      <div className="space-y-6 px-6">
        {/* --- 1. Expiring Soon Banner --- */}
        {urgentItem && (
          <div className="bg-[#fff1f1] border border-red-50 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-xl">
                <Calendar className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Expiring Soon
                </h3>
                <p className="text-xs text-slate-500">
                  {urgentItem.name} expires in {urgentDays} days
                </p>
              </div>
            </div>
            <Badge className="bg-red-500 text-white rounded-full px-3 py-1 text-xs border-none">
              D-{urgentDays}
            </Badge>
          </div>
        )}

        {/* --- 2. Quick Action Buttons --- */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/ingredients/new">
            <Button className="h-14 w-full bg-[#e8f7f2] hover:bg-[#d1eee4] text-[#1d7d5e] rounded-2xl border-none shadow-none flex flex-col items-center justify-center gap-0">
              <Plus className="h-5 w-5" />
              <span className="text-[11px] font-bold">Add Item</span>
            </Button>
          </Link>
          <Link to="/recipes">
            <Button className="h-14 w-full bg-[#e8f7f2] hover:bg-[#d1eee4] text-[#1d7d5e] rounded-2xl border-none shadow-none flex flex-col items-center justify-center gap-0">
              <ChefHat className="h-5 w-5" />
              <span className="text-[11px] font-bold">Recipe</span>
            </Button>
          </Link>
        </div>

        {/* --- 3. My Ingredients 섹션 --- */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">My Ingredients</h2>
            <Link
              to="/ingredients"
              className="text-[#56cc9d] text-sm font-semibold"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {/* 로딩 중일 때와 데이터가 있을 때를 구분해서 렌더링 */}
            {ingredients && ingredients.length > 0 ? (
              ingredients.slice(0, 5).map((ingredient) => {
                const daysLeft = getDaysUntilExpiration(
                  ingredient.expiration_date,
                );

                const icon = getCategoryIcon(ingredient.category);
                console.log("아이콘 찾는 중 -> 카테고리:", ingredient.category);

                return (
                  <Link
                    key={ingredient._id}
                    to={`/ingredients/${ingredient._id}`}
                    className="block bg-white border border-slate-50 rounded-2xl p-4 shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                        {icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">
                          {ingredient.name}
                        </h4>
                        <p className="text-xs text-slate-400">
                          Exp: {ingredient.expiration_date}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={
                        daysLeft !== null && daysLeft < 3
                          ? "bg-red-500"
                          : "bg-[#56cc9d]"
                      }
                    >
                      {daysLeft !== null && daysLeft < 3
                        ? `D-${daysLeft}`
                        : "Fresh"}
                    </Badge>
                  </Link>
                );
              })
            ) : loading ? (
              <p className="text-center py-10 text-slate-400 text-sm">
                Loading fridge...
              </p>
            ) : (
              <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm">No ingredients found.</p>
              </div>
            )}
          </div>
        </section>

        {/* --- 4. Shared Board (Figma에 새로 추가된 섹션) --- */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Shared Board</h2>
            <Link to="/share" className="text-[#56cc9d] text-sm font-semibold">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {sharedPosts.length > 0 ? (
              sharedPosts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white border border-slate-50 rounded-[32px] p-4 shadow-sm text-center"
                >
                  <div className="w-16 h-16 bg-slate-50 rounded-full mx-auto mb-3 flex items-center justify-center overflow-hidden">
                    {post.photo_url ? (
                      <img
                        src={post.photo_url}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      "🎁"
                    )}
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm truncate">
                    {post.ingredient_name}
                  </h4>
                  <Badge
                    variant="secondary"
                    className="bg-[#e8f7f2] text-[#1d7d5e] border-none my-2 px-3"
                  >
                    {post.pickup_type}
                  </Badge>
                  <p className="text-[10px] text-slate-400">
                    From: {post.user_id?.fullName || "User"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground col-span-2 text-center py-4">
                No shared items yet.
              </p>
            )}
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
