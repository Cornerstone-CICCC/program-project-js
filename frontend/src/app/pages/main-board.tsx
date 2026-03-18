//main-board.tsx
import { Link } from "react-router-dom";
import {
  Bell,
  Settings,
  Calendar,
  ChefHat,
  Plus,
  Check,
  AlertTriangle,
  Share2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useIngredients } from "../hooks";
import logo from "../../assets/logo.png";
import { BottomNav } from "../components/BottomNav";

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

  const userName = localStorage.getItem("currentUserName") || "User";

  const expiringSoonCount = ingredients.filter((ingredient) => {
    const daysLeft = getDaysUntilExpiration(ingredient.expiration_date);
    return daysLeft !== null && daysLeft >= 0 && daysLeft < 3;
  }).length;

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="bg-card px-6 py-4 border-b border-border shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="FridgeFriend Logo" className="h-10 w-10" />

            <h1 className="text-2xl">
              Hello,{" "}
              <Link
                to="/profile"
                className="text-[#1d7d5e] hover:underline underline-offset-4"
              >
                {userName}
              </Link>
              ! 👋
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer rounded-full hover:bg-[#1d7d5e]/10"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer rounded-full hover:bg-[#1d7d5e]/10"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <p className="text-muted-foreground">
          Manage your ingredients and reduce food waste
        </p>
      </div>

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm text-muted-foreground">
                Total Ingredients
              </h2>
              <ChefHat className="h-5 w-5 text-[#1d7d5e]" />
            </div>
            <p className="text-2xl font-semibold">{ingredients.length}</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm text-muted-foreground">Expiring Soon</h2>
              <Calendar
                className={`h-5 w-5 ${
                  expiringSoonCount > 0 ? "text-red-500" : "text-[#1d7d5e]"
                }`}
              />
            </div>
            <p
              className={`text-2xl font-semibold ${
                expiringSoonCount > 0 ? "text-red-500" : ""
              }`}
            >
              {expiringSoonCount}
            </p>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Ingredients</h2>

            <Link to="/ingredients">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer rounded-xl bg-white hover:border-[#1d7d5e] hover:text-[#1d7d5e]"
              >
                View All
              </Button>
            </Link>
          </div>

          {loading ? (
            <p className="text-muted-foreground">Loading ingredients...</p>
          ) : error ? (
            <p className="text-destructive">{error}</p>
          ) : ingredients.length === 0 ? (
            <div className="py-8 text-center">
              <p className="mb-4 text-muted-foreground">
                No ingredients added yet
              </p>

              <Link to="/ingredients/new">
                <Button className="cursor-pointer rounded-xl bg-[#1d7d5e] text-white hover:bg-[#17664c]">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Ingredient
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {ingredients.slice(0, 5).map((ingredient) => {
                const expirationDate = ingredient.expiration_date;
                const storeName = ingredient.store_name;
                const daysLeft = getDaysUntilExpiration(expirationDate);
                const ddayLabel = getDdayLabel(daysLeft);
                const isUrgent = daysLeft !== null && daysLeft < 3;
                const isExpired = daysLeft !== null && daysLeft < 0;

                return (
                  <Link
                    key={ingredient._id}
                    to={`/ingredients/${ingredient._id}`}
                    className="block"
                  >
                    <div
                      className={`flex items-center justify-between rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md ${
                        isUrgent
                          ? "border-red-300 bg-red-50"
                          : "border-border bg-white"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p
                            className={`font-medium ${
                              isUrgent ? "text-red-700" : "text-foreground"
                            }`}
                          >
                            {ingredient.name}
                          </p>

                          {ingredient.is_shared && (
                            <Badge className="bg-[#1d7d5e]/10 text-[#1d7d5e]">
                              <Share2 className="mr-1 h-3 w-3" />
                              Shared
                            </Badge>
                          )}

                          {isUrgent && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {storeName || "Unknown store"}
                        </p>
                      </div>

                      <div className="space-y-1 text-right">
                        {expirationDate && (
                          <Badge
                            variant="secondary"
                            className={
                              isExpired
                                ? "bg-red-100 text-red-700"
                                : isUrgent
                                  ? "bg-red-100 text-red-700"
                                  : "bg-[#1d7d5e]/10 text-[#1d7d5e]"
                            }
                          >
                            {expirationDate}
                          </Badge>
                        )}

                        {ddayLabel && (
                          <p
                            className={`text-xs font-semibold ${
                              isExpired
                                ? "text-red-600"
                                : isUrgent
                                  ? "text-red-600"
                                  : "text-[#1d7d5e]"
                            }`}
                          >
                            {ddayLabel}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link to="/ingredients/new">
            <Button className="h-12 w-full cursor-pointer rounded-2xl bg-[#1d7d5e] text-white shadow-sm hover:bg-[#17664c] hover:shadow-md">
              <Plus className="mr-2 h-4 w-4" />
              Add Ingredient
            </Button>
          </Link>

          <Link to="/recipes">
            <Button
              variant="outline"
              className="h-12 w-full cursor-pointer rounded-2xl bg-white shadow-sm hover:border-[#1d7d5e] hover:text-[#1d7d5e] hover:shadow-md"
            >
              <Check className="mr-2 h-4 w-4" />
              View Recipes
            </Button>
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}