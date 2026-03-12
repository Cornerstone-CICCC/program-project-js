import { useState } from "react";
import { ArrowLeft, MapPin, Filter, Search } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "../components/BottomNav";

export function ShareBoard() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "free" | "pickup">("all");

  const sharedItems = [
    {
      id: 1,
      name: "Apples",
      image: "🍎",
      status: "Free",
      from: "Minho",
      location: "Building B-2",
      distance: "100m",
      quantity: "5 apples",
    },
    {
      id: 2,
      name: "Milk (2L)",
      image: "🥛",
      status: "Free",
      from: "Jiyeon",
      location: "Building D-5",
      distance: "250m",
      quantity: "1 bottle",
    },
    {
      id: 3,
      name: "Yogurt (3)",
      image: "🥛",
      status: "Pickup",
      from: "Minho",
      location: "Building D-5",
      distance: "250m",
      quantity: "3 cups",
    },
    {
      id: 4,
      name: "Carrots",
      image: "🥕",
      status: "Free",
      from: "Sora",
      location: "Building A-1",
      distance: "50m",
      quantity: "Bunch of 6",
    },
    {
      id: 5,
      name: "Bread",
      image: "🥖",
      status: "Pickup",
      from: "Sora",
      location: "Building C-3",
      distance: "180m",
      quantity: "1 loaf",
    },
    {
      id: 6,
      name: "Strawberries",
      image: "🍓",
      status: "Free",
      from: "Minsu",
      location: "Building B-4",
      distance: "120m",
      quantity: "1 box",
    },
  ];

  const filteredItems = sharedItems.filter((item) => {
    if (filter === "all") return true;
    return item.status.toLowerCase() === filter;
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
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-full h-24 bg-secondary/30 rounded-xl flex items-center justify-center text-4xl mb-3">
                {item.image}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm">{item.name}</h3>

                  <Badge
                    variant={item.status === "Free" ? "default" : "secondary"}
                    className={`text-xs rounded-full ${
                      item.status === "Free"
                        ? "bg-primary/20 text-primary"
                        : "bg-accent/20 text-accent"
                    }`}
                  >
                    {item.status}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground">{item.quantity}</p>

                <div className="pt-2 border-t border-border">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <span className="text-sm">👤</span>
                    <span>From: {item.from}</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{item.distance}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Item Button */}
        <Button className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg">
          <span className="text-2xl">+</span>
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}