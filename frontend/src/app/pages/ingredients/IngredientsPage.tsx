// src/app/pages/ingredients/IngredientsPage.tsx
import { Link } from "react-router-dom";
import { Bell, Settings, Calendar, ChefHat, Plus, Check } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useIngredients } from "../../hooks/useIngredients";
import type { Ingredient } from "../../models/ingredient";
import { daysUntil, isExpired, isExpiringSoon } from "../../utils/dateUtils";
import { formatDateShort } from "../../utils/formatters";

function getEmoji(name: string) {
  const n = name.toLowerCase();
  if (n.includes("milk")) return "🥛";
  if (n.includes("egg")) return "🥚";
  if (n.includes("apple")) return "🍎";
  if (n.includes("banana")) return "🍌";
  if (n.includes("bread")) return "🥖";
  if (n.includes("meat") || n.includes("pork") || n.includes("beef")) return "🥩";
  if (n.includes("chicken")) return "🍗";
  if (n.includes("onion")) return "🧅";
  if (n.includes("tomato")) return "🍅";
  if (n.includes("carrot")) return "🥕";
  if (n.includes("fish")) return "🐟";
  return "🍽️";
}

function getStatus(ingredient: Ingredient) {
  if (isExpired(ingredient.expirationDate)) return "expired" as const;
  if (isExpiringSoon(ingredient.expirationDate, 3)) return "expiring" as const;
  return "fresh" as const;
}

export default function IngredientsPage() {
  const token = localStorage.getItem("ff_token");
  const { items, isLoading, error, refresh } = useIngredients(token);

  // 가장 임박한 재료 1개를 상단 경고로
  const expiringSoonItem = (() => {
    const candidates = items
      .filter((i) => !isExpired(i.expirationDate))
      .map((i) => ({ i, d: daysUntil(i.expirationDate) }))
      .filter((x) => x.d >= 0)
      .sort((a, b) => a.d - b.d);
    return candidates[0]?.i ?? null;
  })();

  const expiringDaysLeft = expiringSoonItem ? daysUntil(expiringSoonItem.expirationDate) : null;
  const expiringIsUrgent = expiringSoonItem ? isExpiringSoon(expiringSoonItem.expirationDate, 3) : false;

  // Figma에 있던 "checked" UI는 DB에 없으니,
  // 임시로 "is_shared면 체크 표시"로 대체(원하면 나중에 consumed 필드 붙이면 됨)
  const isChecked = (i: Ingredient) => i.isShared;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl">
            Hello, <span className="text-primary">Friend</span>! 👋
          </h1>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full" asChild>
              <Link to="/notifications">
                <Bell className="w-5 h-5" />
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              type="button"
              onClick={() => alert("Settings page: coming soon")}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-4">
        {/* Top state */}
        {isLoading && <div className="text-sm text-muted-foreground mb-4">Loading ingredients...</div>}
        {error && (
          <div className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Expiring Soon Alert (real data) */}
        {expiringSoonItem && expiringIsUrgent && expiringDaysLeft !== null && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-destructive/20 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-destructive" />
              </div>

              <div className="flex-1">
                <h3 className="text-sm mb-1">Expiring Soon</h3>
                <p className="text-xs text-muted-foreground">
                  {expiringSoonItem.name} expires in {expiringDaysLeft} day{expiringDaysLeft === 1 ? "" : "s"} (
                  {formatDateShort(expiringSoonItem.expirationDate)})
                </p>
              </div>

              <Badge variant="destructive" className="rounded-full">
                D-{expiringDaysLeft}
              </Badge>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link to="/ingredients/new">
            <Button
              variant="outline"
              className="w-full flex flex-col items-center gap-2 py-6 rounded-2xl border-2"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs">Add Item</span>
            </Button>
          </Link>

          <Link to="/recipes">
            <Button
              variant="outline"
              className="w-full flex flex-col items-center gap-2 py-6 rounded-2xl border-2"
            >
              <div className="w-12 h-12 bg-secondary/50 rounded-full flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs">Recipe</span>
            </Button>
          </Link>
        </div>

        {/* Ingredients List */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg">My Ingredients</h2>
          <Button variant="ghost" size="sm" className="text-primary" type="button" onClick={refresh}>
            Refresh
          </Button>
        </div>

        <div className="space-y-3">
          {items.map((item) => {
            const status = getStatus(item);
            const dLeft = daysUntil(item.expirationDate);

            const badgeVariant =
              status === "expiring" || status === "expired" ? "destructive" : "secondary";

            const badgeText =
              status === "expired" ? "Expired" : status === "expiring" ? `D-${dLeft}` : "Fresh";

            return (
              <div key={item.id} className="bg-card rounded-2xl p-4 shadow-sm border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary/30 rounded-xl flex items-center justify-center text-2xl">
                    {getEmoji(item.name)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm">{item.name}</h3>

                      {isChecked(item) && (
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Exp: {formatDateShort(item.expirationDate)}
                      {item.storeName ? ` • ${item.storeName}` : ""}
                    </p>
                  </div>

                  <Badge variant={badgeVariant as any} className="rounded-full">
                    {badgeText}
                  </Badge>
                </div>
              </div>
            );
          })}

          {!isLoading && !error && items.length === 0 && (
            <div className="bg-card rounded-2xl p-6 border border-border text-sm text-muted-foreground">
              No ingredients yet. Add your first item!
            </div>
          )}
        </div>

        {/* Shared Board Preview (static preview for now) */}
        <div className="mt-8 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg">Shared Board</h2>
            <Link to="/share">
              <Button variant="ghost" size="sm" className="text-primary">
                View All
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-2xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm">
                  🍎
                </div>
                <div className="flex-1">
                  <p className="text-sm">Apples</p>
                  <Badge className="bg-primary/20 text-primary text-xs">Free</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">From: Minho</p>
            </div>

            <div className="bg-card rounded-2xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center text-sm">
                  🥖
                </div>
                <div className="flex-1">
                  <p className="text-sm">Bread</p>
                  <Badge className="bg-accent/20 text-accent text-xs">Pickup</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">From: Sora</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}