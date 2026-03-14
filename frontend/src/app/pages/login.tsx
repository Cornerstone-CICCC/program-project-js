//login.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import logo from "../../assets/logo.png";
import { authService } from "../services/authService";

export function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setIsLoading(true);

      const result = await authService.login({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      localStorage.setItem("token", result.token);
      localStorage.setItem("currentUserEmail", result.user.email);
      localStorage.setItem(
        "currentUserName",
        result.user.fullName ||
          `${result.user.firstName ?? ""} ${result.user.lastName ?? ""}`.trim() ||
          "User",
      );

      navigate("/ingredients");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="FridgeFriend Logo" className="w-28 h-28" />
          </div>

          <h1 className="text-4xl mb-2 flex items-center justify-center gap-2">
            <span className="text-foreground">Fridge</span>
            <span className="text-[#1d7d5e]">Friend</span>
          </h1>

          <p className="text-sm text-muted-foreground">Welcome back! 👋</p>
        </div>

        <div className="bg-card rounded-3xl p-8 shadow-lg">
          <h2 className="mb-6 text-center">Log In</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm" htmlFor="login-email">
                Email
              </label>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus-visible:border-[#1d7d5e] focus-visible:ring-[3px] focus-visible:ring-[#1d7d5e]/20"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm" htmlFor="login-password">
                Password
              </label>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus-visible:border-[#1d7d5e] focus-visible:ring-[3px] focus-visible:ring-[#1d7d5e]/20"
              />
            </div>

            <div className="text-right">
              <a href="#" className="text-sm text-[#1d7d5e]">
                Forgot password?
              </a>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full cursor-pointer bg-[#1d7d5e] hover:bg-[#17664c] text-white py-6 rounded-xl mt-6 disabled:opacity-60"
            >
              {isLoading ? "Logging in..." : "Log In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-[#1d7d5e]">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}