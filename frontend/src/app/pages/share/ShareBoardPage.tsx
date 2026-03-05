// src/app/pages/share/ShareBoardPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Filter, Search } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";

import { shareService } from "../../services/shareService";
import type { SharedPost } from "../../models/share";
import { isExpired } from "../../utils/dateUtils";

function emojiForIngredient(name?: string) {
  const n = (name ?? "").toLowerCase();
  if (n.includes("apple")) return "🍎";
  if (n.includes("milk")) return "🥛";
  if (n.includes("yogurt")) return "🥛";
  if (n.includes("carrot")) return "🥕";
  if (n.includes("bread")) return "🥖";
  if (n.includes("strawberry")) return "🍓";
  if (n.includes("egg")) return "🥚";
  return "🥫";
}

function pickupLabel(pickupType?: string) {
  // 우리 ERD에서 pickup_type varchar
  // 예시: "door_pickup" | "public_meetup"
  if (pickupType === "door_pickup") return "Free";
  if (pickupType === "public_meetup") return "Pickup";
  return "Free";
}

export default function ShareBoardPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("ff_token");

  const [filter, setFilter] = useState<"all" | "free" | "pickup">("all");
  const [q, setQ] = useState("");

  const [items, setItems] = useState<SharedPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    setErr(null);
    try {
      const data = await shareService.listPublic();
      setItems(data);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load shared items");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filteredItems = useMemo(() => {
    const term = q.trim().toLowerCase();

    return items
      .filter((p) => {
        // only show non-expired if ingredient has exp date
        const exp = p.ingredient?.expirationDate;
        if (exp && isExpired(exp)) return false;

        const name = (p.ingredient?.name ?? "").toLowerCase();
        const store = (p.ingredient?.storeName ?? "").toLowerCase();
        const okSearch = !term || name.includes(term) || store.includes(term);

        if (!okSearch) return false;

        // Status filter: treat "Available" as p.status === "available" (or show all if undefined)
        const availableOk = !p.status || p.status === "available";
        if (filter === "all") return availableOk;

        // Figma filter tabs: free/pickup
        const label = pickupLabel(p.pickupType).toLowerCase(); // "free" | "pickup"
        return availableOk && label === filter;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [items, q, filter]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card px-6 py-4 border-b border-border">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            type="button"
            onClick={() => navigate("/ingredients")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl">Shared Board</h1>

          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-primary"
            type="button"
            onClick={load}
          >
            Refresh
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
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
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full ${filter === "all" ? "bg-primary text-white" : ""}`}
          >
            Available
          </Button>

          <Button
            variant={filter === "free" ? "default" : "outline"}
            size="sm"
            type="button"
            onClick={() => setFilter("free")}
            className={`rounded-full ${filter === "free" ? "bg-primary text-white" : ""}`}
          >
            Free
          </Button>

          <Button
            variant={filter === "pickup" ? "default" : "outline"}
            size="sm"
            type="button"
            onClick={() => setFilter("pickup")}
            className={`rounded-full ${filter === "pickup" ? "bg-accent text-white" : ""}`}
          >
            Pickup
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="rounded-full ml-auto"
            type="button"
            onClick={() => alert("Advanced filters: coming soon")}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {isLoading && <div className="text-sm text-muted-foreground mb-3">Loading...</div>}
        {err && (
          <div className="mb-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {err}
          </div>
        )}

        {/* Shared Items Grid */}
        <div className="grid grid-cols-2 gap-4">
          {filteredItems.map((post) => {
            const ing = post.ingredient;
            const name = ing?.name ?? "Shared Item";
            const statusLabel = pickupLabel(post.pickupType); // Free/Pickup label

            // We don't have location/distance in ERD; keep UI but show placeholders.
            const fromName = post.userId ? `User(${post.userId.slice(0, 6)})` : "User";
            const quantity = "1 item";
            const distance = "—";

            return (
              <button
                key={post.id}
                type="button"
                onClick={() => navigate(`/chat?postId=${encodeURIComponent(post.id)}`)}
                className="text-left bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-full h-24 bg-secondary/30 rounded-xl flex items-center justify-center text-4xl mb-3">
                  {post.photoUrl ? (
                    <img src={post.photoUrl} alt="" className="h-full w-full object-cover rounded-xl" />
                  ) : (
                    <span>{emojiForIngredient(name)}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm truncate">{name}</h3>
                    <Badge
                      variant={statusLabel === "Free" ? "default" : "secondary"}
                      className={`text-xs rounded-full ${
                        statusLabel === "Free"
                          ? "bg-primary/20 text-primary"
                          : "bg-accent/20 text-accent"
                      }`}
                    >
                      {statusLabel}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground truncate">
                    {quantity}
                    {ing?.storeName ? ` • ${ing.storeName}` : ""}
                  </p>

                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <span className="text-sm">👤</span>
                      <span className="truncate">From: {fromName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{distance}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {!isLoading && !err && filteredItems.length === 0 && (
          <div className="mt-6 bg-card rounded-2xl p-6 border border-border text-sm text-muted-foreground">
            No shared items found.
          </div>
        )}

        {/* Add Item Button */}
        <Button
          type="button"
          className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg"
          onClick={() => {
            if (!token) {
              navigate("/login");
              return;
            }
            alert("To share an item, go to Home → pick an ingredient → Share (coming soon).");
            navigate("/ingredients");
          }}
          title="Share an item"
        >
          <span className="text-2xl">+</span>
        </Button>
      </div>
    </div>
  );
}