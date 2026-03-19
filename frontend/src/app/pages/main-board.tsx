import { Link } from "react-router-dom";
import {
  Bell,
  Settings,
  Calendar,
  ChefHat,
  Plus,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useIngredients } from "../hooks";
import logo from "../../assets/logo.png";
import { BottomNav } from "../components/BottomNav";
import { useEffect, useState } from "react";
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

function getDdayLabel(daysLeft: number | null) {
  if (daysLeft === null) return null;
  if (daysLeft === 0) return "D-Day";
  if (daysLeft > 0) return `D-${daysLeft}`;
  return `Expired ${Math.abs(daysLeft)}d`;
}

export function MainBoard() {
  const { ingredients, loading, error } = useIngredients();
  const [sharedPosts, setSharedPosts] = useState<any[]>([]); // 공유 데이터 상태 추가
  const userName = localStorage.getItem("currentUserName") || "User";

  // Shared Board 데이터를 가져옵니다.
  useEffect(() => {
    const fetchShared = async () => {
      try {
        const data = await shareService.getAll();
        setSharedPosts(data.slice(0, 2)); // 상위 2개만 표시
      } catch (e) {
        console.error(e);
      }
    };
    fetchShared();
  }, []);

  // 가장 임박한 아이템 하나 찾기 (상단 배너용)
  const urgentItem = [...ingredients]
    .filter((i) => getDaysUntilExpiration(i.expiration_date) !== null)
    .sort(
      (a, b) =>
        new Date(a.expiration_date).getTime() -
        new Date(b.expiration_date).getTime(),
    )[0];

  const urgentDays = urgentItem
    ? getDaysUntilExpiration(urgentItem.expiration_date)
    : null;

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
        {/* --- 1. Expiring Soon Banner (Figma 스타일 알림창) --- */}
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

        {/* --- 2. Quick Action Buttons (기존 하단 버튼을 Figma 스타일로 재배치) --- */}
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

        {/* --- 3. My Ingredients (기존 Recent Ingredients 섹션 유지 및 다듬기) --- */}
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
            {ingredients.slice(0, 5).map((ingredient) => {
              const daysLeft = getDaysUntilExpiration(
                ingredient.expiration_date,
              );
              return (
                <Link
                  key={ingredient._id}
                  to={`/ingredients/${ingredient._id}`}
                  className="block bg-white border border-slate-50 rounded-2xl p-4 shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl">
                      {/* 재료 아이콘 (추후 카테고리별 매핑 가능) */}
                      🍎
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
                        ? "bg-red-500 text-white border-none"
                        : "bg-[#56cc9d] text-white border-none"
                    }
                  >
                    {daysLeft !== null && daysLeft < 3
                      ? `D-${daysLeft}`
                      : "Fresh"}
                  </Badge>
                </Link>
              );
            })}
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
