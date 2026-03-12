import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import logo from "../../assets/logo.png";

export function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    navigate("/ingredients");
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
            <span className="text-primary">Friend</span>
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
                className="w-full px-4 py-3 bg-input-background rounded-xl border-0"
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
                className="w-full px-4 py-3 bg-input-background rounded-xl border-0"
              />
            </div>

            <div className="text-right">
              <a href="#" className="text-sm text-primary">
                Forgot password?
              </a>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-xl mt-6"
            >
              Log In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}