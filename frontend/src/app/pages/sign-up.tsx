import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Leaf } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../components/ui/use-toast.tsx";
import logo from "../../assets/logo.png";

export function SignUp() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailIsValid = useMemo(() => {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  const passwordChecks = useMemo(() => {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    return {
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecial,
    };
  }, [password]);

  const passwordStrength = useMemo(() => {
    const score = Object.values(passwordChecks).filter(Boolean).length;

    if (!password) {
      return {
        label: "",
        widthClass: "w-0",
        colorClass: "bg-transparent",
        textClass: "text-muted-foreground",
      };
    }

    if (score <= 2) {
      return {
        label: "Weak",
        widthClass: "w-1/3",
        colorClass: "bg-red-500",
        textClass: "text-red-500",
      };
    }

    if (score <= 4) {
      return {
        label: "Medium",
        widthClass: "w-2/3",
        colorClass: "bg-yellow-500",
        textClass: "text-yellow-500",
      };
    }

    return {
      label: "Strong",
      widthClass: "w-full",
      colorClass: "bg-green-500",
      textClass: "text-green-500",
    };
  }, [password, passwordChecks]);

  const passwordsMatch =
    confirmPassword.length === 0 || password === confirmPassword;

  const handleSignUp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (!emailIsValid) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (!passwordChecks.hasMinLength) {
      toast({
        title: "Weak password",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (!passwordChecks.hasUppercase) {
      toast({
        title: "Weak password",
        description: "Password must include at least 1 uppercase letter.",
        variant: "destructive",
      });
      return;
    }

    if (!passwordChecks.hasLowercase) {
      toast({
        title: "Weak password",
        description: "Password must include at least 1 lowercase letter.",
        variant: "destructive",
      });
      return;
    }

    if (!passwordChecks.hasNumber) {
      toast({
        title: "Weak password",
        description: "Password must include at least 1 number.",
        variant: "destructive",
      });
      return;
    }

    if (!passwordChecks.hasSpecial) {
      toast({
        title: "Weak password",
        description: "Password must include at least 1 special character.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Account created 🎉",
      description: "Your account was created successfully. Please log in.",
    });

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src={logo}
              alt="FridgeFriend Logo"
              className="w-28 h-28 drop-shadow-sm"
            />
          </div>

          <h1 className="text-4xl mb-2 flex items-center justify-center gap-2">
            <span className="text-foreground">Fridge</span>
            <span className="text-primary">Friend</span>
          </h1>

          <p className="text-sm text-muted-foreground">
            Smart Food Management & Sharing
          </p>
        </div>

        <div className="bg-card rounded-3xl p-8 shadow-lg">
          <h2 className="mb-6 text-center text-xl">Create Account</h2>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label htmlFor="signup-name" className="block mb-2 text-sm">
                Name
              </label>
              <Input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl"
              />
            </div>

            <div>
              <label htmlFor="signup-email" className="block mb-2 text-sm">
                Email
              </label>
              <Input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={`w-full px-4 py-3 rounded-xl ${
                  email && !emailIsValid ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              />
              {email && !emailIsValid && (
                <p className="text-xs text-red-500 mt-2">
                  Please enter a valid email address.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="signup-password" className="block mb-2 text-sm">
                Password
              </label>

              <div className="relative">
                <Input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full px-4 py-3 pr-12 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div className="mt-3">
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength.widthClass} ${passwordStrength.colorClass}`}
                  />
                </div>
                {passwordStrength.label && (
                  <p className={`text-xs mt-2 ${passwordStrength.textClass}`}>
                    Strength: {passwordStrength.label}
                  </p>
                )}
              </div>

              <div className="mt-3 text-xs text-muted-foreground space-y-1">
                <p>Password must include:</p>
                <p className={passwordChecks.hasMinLength ? "text-green-600" : ""}>
                  • At least 8 characters
                </p>
                <p className={passwordChecks.hasUppercase ? "text-green-600" : ""}>
                  • 1 uppercase letter
                </p>
                <p className={passwordChecks.hasLowercase ? "text-green-600" : ""}>
                  • 1 lowercase letter
                </p>
                <p className={passwordChecks.hasNumber ? "text-green-600" : ""}>
                  • 1 number
                </p>
                <p className={passwordChecks.hasSpecial ? "text-green-600" : ""}>
                  • 1 special character
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="signup-confirm-password" className="block mb-2 text-sm">
                Confirm Password
              </label>

              <div className="relative">
                <Input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className={`w-full px-4 py-3 pr-12 rounded-xl ${
                    confirmPassword && !passwordsMatch
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-500 mt-2">
                  Passwords do not match.
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-xl mt-6"
            >
              Sign Up
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