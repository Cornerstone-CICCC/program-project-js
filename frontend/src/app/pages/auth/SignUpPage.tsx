// src/app/pages/auth/SignUpPage.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";

import { authService } from "../../services/authService";

// ⚠️ 경로는 너희 프로젝트에 맞게 조정!
// SignUpPage가 src/app/pages/auth/ 에 있으면 보통 이렇게 됨:
// src/app/pages/auth -> src/app/components/ui
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export default function SignUpPage() {
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await authService.signUp({ name, email, password });
      localStorage.setItem("ff_token", res.token);
      nav("/ingredients", { replace: true });
    } catch (e: any) {
      setErr(e?.message ?? "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-secondary rounded-3xl mb-4 shadow-lg">
            <div className="text-6xl">🧊</div>
          </div>
          <h1 className="text-4xl mb-2 flex items-center justify-center gap-2">
            <span className="text-foreground">Fridge</span>
            <span className="text-primary">Friend</span>
          </h1>
          <p className="text-sm text-muted-foreground">Smart Food Management & Sharing</p>
        </div>

        {/* Form */}
        <div className="bg-card rounded-3xl p-8 shadow-lg">
          <h2 className="mb-6 text-center">Create Account</h2>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm">Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-input-background rounded-xl border-0"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-input-background rounded-xl border-0"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full px-4 py-3 bg-input-background rounded-xl border-0"
              />
            </div>

            {err && <div className="text-sm text-red-600">{err}</div>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-xl mt-6 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Sign Up"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary">
                Log In
              </Link>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary" />
            </div>
            <span>Track your ingredients & reduce food waste</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-primary">👥</span>
            </div>
            <span>Share food with friends & neighbors</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-primary">🍳</span>
            </div>
            <span>Get AI-powered recipe suggestions</span>
          </div>
        </div>
      </div>
    </div>
  );
}