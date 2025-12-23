"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  MapPin,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { account, OAuthProvider } from "@/lib/appwrite";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
        try {
            await account.get();
            router.replace('/dashboard');
        } catch (error) {
            // Not logged in
        }
    };
    checkSession();
  }, [router]);

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Clear specific error when user starts typing
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: "", general: "" }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: "", general: "" }));
    }
  };

  // Validate form before submission
  const validateForm = (formEmail, formPassword) => {
    const newErrors = { email: "", password: "", general: "" };
    let isValid = true;

    if (!formEmail) {
      newErrors.email = "Email address is required";
      isValid = false;
    } else if (!validateEmail(formEmail)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!formPassword) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formPassword.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Read from form for resilience (autofill / non-standard input event dispatch)
    const form = e.currentTarget;
    const fd = new FormData(form);
    const formEmail = String(fd.get("email") || email || "").trim();
    const formPassword = String(fd.get("password") || password || "");

    // Validate form
    if (!validateForm(formEmail, formPassword)) {
      return;
    }

    setLoading(true);
    setErrors({ email: "", password: "", general: "" });

    try {
      // Check if there's an existing session and delete it first
      try {
        await account.get();
        // If we get here, user is already logged in - delete current session
        await account.deleteSession("current");
      } catch (err) {
        // No active session, proceed with login
      }

      const session = await account.createEmailPasswordSession(
        formEmail,
        formPassword,
      );
      const user = await account.get();

      toast.success("ආයුබෝවන්! Welcome back!");

      // Check for admin/agent roles or labels
      if (user.labels && user.labels.includes("admin")) {
        router.push("/admin");
      } else if (
        user.prefs &&
        (user.prefs.role === "agent" || user.prefs.agent_profile_created)
      ) {
        router.push("/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error(error);

      // Parse error and show specific messages
      const errorMessage = error.message || "";

      if (
        errorMessage.includes("Invalid credentials") ||
        errorMessage.includes("invalid credentials")
      ) {
        setErrors((prev) => ({
          ...prev,
          general:
            "Invalid email or password. Please check your credentials and try again.",
        }));
      } else if (
        errorMessage.includes("user not found") ||
        errorMessage.includes("User not found")
      ) {
        setErrors((prev) => ({
          ...prev,
          email: "No account found with this email address",
        }));
      } else if (errorMessage.includes("password")) {
        setErrors((prev) => ({
          ...prev,
          password: "Incorrect password. Please try again.",
        }));
      } else if (
        errorMessage.includes("too many") ||
        errorMessage.includes("rate limit")
      ) {
        setErrors((prev) => ({
          ...prev,
          general:
            "Too many login attempts. Please wait a few minutes and try again.",
        }));
      } else if (
        errorMessage.includes("network") ||
        errorMessage.includes("Network")
      ) {
        setErrors((prev) => ({
          ...prev,
          general: "Network error. Please check your internet connection.",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          general: errorMessage || "Login failed. Please try again.",
        }));
      }

      toast.error("Login failed. Please check the errors below.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Background */}
      <div className="live-gradient absolute inset-0 opacity-90" />
      <div className="animate-float absolute top-20 left-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="animate-float-delayed absolute right-10 bottom-20 h-80 w-80 rounded-full bg-purple-300/20 blur-3xl" />

      <div className="animate-fade-in relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="group inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg transition-transform group-hover:scale-110">
              <MapPin className="h-6 w-6 text-[#10b981]" />
            </div>
            <span className="text-2xl font-bold text-white">
              LandSale<span className="text-yellow-300">.lk</span>
            </span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-white">Welcome Back!</h1>
          <p className="mt-2 text-white/70">Sign in to continue</p>
        </div>

        {/* Form */}
        <div className="glass-panel relative rounded-3xl p-8 pt-14 shadow-2xl">
          {/* Lock Icon */}
          <div className="absolute -top-8 left-1/2 flex h-16 w-16 -translate-x-1/2 transform items-center justify-center rounded-2xl bg-white shadow-xl">
            <svg
              viewBox="0 0 200 200"
              fill="none"
              className="h-10 w-10"
              aria-hidden="true"
            >
              <path
                d="M60 90V60C60 30 80 20 100 20C120 20 140 30 140 60V90"
                stroke="#9CA3AF"
                strokeWidth="15"
                strokeLinecap="round"
              />
              <rect
                x="40"
                y="90"
                width="120"
                height="90"
                rx="15"
                fill="#FCD34D"
                stroke="#F59E0B"
                strokeWidth="5"
              />
              <circle
                cx="100"
                cy="130"
                r="12"
                fill="#FFF"
                stroke="#F59E0B"
                strokeWidth="3"
              />
              <path
                d="M100 130V150"
                stroke="#F59E0B"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* General Error Message */}
          {errors.general && (
            <div
              className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600"
              role="alert"
            >
              <AlertCircle
                className="mt-0.5 h-5 w-5 flex-shrink-0"
                aria-hidden="true"
              />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="you@example.com"
                  required
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={`w-full rounded-2xl border-2 bg-slate-50 py-4 pr-4 pl-12 font-bold text-slate-700 transition-all outline-none focus:bg-white ${
                    errors.email
                      ? "border-red-400 focus:border-red-500"
                      : "border-transparent focus:border-[#6ee7b7]"
                  }`}
                />
              </div>
              {errors.email && (
                <p
                  id="email-error"
                  className="mt-1.5 flex items-center gap-1 text-sm font-medium text-red-600"
                  role="alert"
                >
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  required
                  aria-invalid={errors.password ? "true" : "false"}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  className={`w-full rounded-2xl border-2 bg-slate-50 py-4 pr-12 pl-12 font-bold text-slate-700 transition-all outline-none focus:bg-white ${
                    errors.password
                      ? "border-red-400 focus:border-red-500"
                      : "border-transparent focus:border-[#6ee7b7]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p
                  id="password-error"
                  className="mt-1.5 flex items-center gap-1 text-sm font-medium text-red-600"
                  role="alert"
                >
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end text-sm">
              <Link
                href="/auth/forgot-password"
                className="font-bold text-[#10b981] hover:text-[#059669]"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex w-full items-center justify-center gap-2 py-4 text-base"
            >
              {loading ? (
                <>
                  <Loader2
                    className="h-5 w-5 animate-spin"
                    aria-hidden="true"
                  />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          {/* OAuth Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 font-medium text-slate-500">
                or continue with
              </span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                try {
                  if (typeof window !== "undefined") {
                    account.createOAuth2Session(
                      OAuthProvider.Google,
                      `${window.location.origin}/dashboard`,
                      `${window.location.origin}/auth/login`,
                    );
                  }
                } catch (error) {
                  console.error("Google OAuth error:", error);
                  toast.error("Failed to initiate Google login: " + error.message);
                }
              }}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
              aria-label="Sign in with Google"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => {
                try {
                  if (typeof window !== "undefined") {
                    account.createOAuth2Session(
                      OAuthProvider.Facebook,
                      `${window.location.origin}/dashboard`,
                      `${window.location.origin}/auth/login`,
                    );
                  }
                } catch (error) {
                  console.error("Facebook OAuth error:", error);
                  toast.error("Failed to initiate Facebook login: " + error.message);
                }
              }}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#1877F2] bg-[#1877F2] px-4 py-3 font-medium text-white transition-all hover:bg-[#166FE5]"
              aria-label="Sign in with Facebook"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>
          </div>

          <div className="mt-6 text-center">
            <span className="text-slate-500">Don&apos;t have an account? </span>
            <Link
              href="/auth/register"
              className="font-bold text-[#10b981] hover:text-[#059669]"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Terms */}
        <div className="mt-6 text-center text-sm text-white/60">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-yellow-300 hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-yellow-300 hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
