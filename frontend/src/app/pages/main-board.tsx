import { Link } from "react-router-dom";
import {
  Bell,
  Settings,
  Calendar,
  ChefHat,
  Plus,
  Check,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useIngredients } from "../hooks";
import logo from "../../assets/logo.png";
import { BottomNav } from "../components/BottomNav";

export function MainBoard() {
  const { ingredients, loading, error } = useIngredients();

  const userName = localStorage.getItem("currentUserName") || "User";

  const expiringSoonCount = ingredients.filter((ingredient) => {
    const expirationDate =
      (ingredient as typeof ingredient & {
        expirationDate?: string;
        expiration_date?: string;
      }).expirationDate ||
      (ingredient as typeof ingredient & {
        expirationDate?: string;
        expiration_date?: string;
      }).expiration_date;

    if (!expirationDate) return false;

    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays >= 0 && diffDays <= 3;
  }).length;

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="bg-card px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="FridgeFriend Logo" className="h-10 w-10" />

            <h1 className="text-2xl">
              Hello,{" "}
              <Link
                to="/profile"
                className="text-primary hover:underline underline-offset-4"
              >
                {userName}
              </Link>
              ! 👋
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <p className="text-muted-foreground">
          Manage your ingredients and reduce food waste
        </p>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card rounded-2xl p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm text-muted-foreground">Total Ingredients</h2>
              <ChefHat className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-semibold">{ingredients.length}</p>
          </div>

          <div className="bg-card rounded-2xl p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm text-muted-foreground">Expiring Soon</h2>
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-semibold">{expiringSoonCount}</p>
          </div>
        </div>

        {/* Recent Ingredients */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Ingredients</h2>

            <Link to="/ingredients">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {loading ? (
            <p className="text-muted-foreground">Loading ingredients...</p>
          ) : error ? (
            <p className="text-destructive">{error}</p>
          ) : ingredients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No ingredients added yet
              </p>

              <Link to="/ingredients/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Ingredient
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {ingredients.slice(0, 5).map((ingredient) => {
                const expirationDate =
                  (ingredient as typeof ingredient & {
                    expirationDate?: string;
                    expiration_date?: string;
                  }).expirationDate ||
                  (ingredient as typeof ingredient & {
                    expirationDate?: string;
                    expiration_date?: string;
                  }).expiration_date;

                const storeName =
                  (ingredient as typeof ingredient & {
                    storeName?: string;
                    store_name?: string;
                  }).storeName ||
                  (ingredient as typeof ingredient & {
                    storeName?: string;
                    store_name?: string;
                  }).store_name;

                return (
                  <div
                    key={ingredient.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border"
                  >
                    <div>
                      <p className="font-medium">{ingredient.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {storeName || "Unknown store"}
                      </p>
                    </div>

                    <div className="text-right">
                      {expirationDate && (
                        <Badge variant="secondary">{expirationDate}</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/ingredients/new">
            <Button className="w-full h-12 rounded-2xl">
              <Plus className="h-4 w-4 mr-2" />
              Add Ingredient
            </Button>
          </Link>

          <Link to="/recipes">
            <Button variant="outline" className="w-full h-12 rounded-2xl">
              <Check className="h-4 w-4 mr-2" />
              View Recipes
            </Button>
          </Link>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}