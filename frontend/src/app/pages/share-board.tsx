//share-board.tsx
import { Link } from "react-router-dom";
import { ArrowLeft, Share2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { BottomNav } from "../components/BottomNav";
import { useIngredients } from "../hooks";

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

export function ShareBoard() {
  const { ingredients, loading, error } = useIngredients();

  const sharedItems = ingredients.filter((item) => item.isShared);

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

                      {ddayLabel && (
                        <p className="text-xs font-semibold text-[#1d7d5e]">
                          {ddayLabel}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
}