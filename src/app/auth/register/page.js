"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  MapPin,
  ArrowRight,
  User,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// Password strength calculator
function calculatePasswordStrength(password) {
  let score = 0;
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  if (checks.minLength) score++;
  if (checks.hasUppercase) score++;
  if (checks.hasLowercase) score++;
  if (checks.hasNumber) score++;
  if (checks.hasSpecial) score++;

  let strength = "weak";
  let color = "bg-red-500";

  if (score >= 4) {
    strength = "strong";
    color = "bg-emerald-500";
  } else if (score >= 3) {
    strength = "medium";
    color = "bg-yellow-500";
  }

  return { score, strength, color, checks };
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    general: "",
  });

  // Calculate password strength
  const passwordStrength = useMemo(
    () => calculatePasswordStrength(password),
    [password],
  );

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Clear specific error when user starts typing
  const handleNameChange = (e) => {
    setName(e.target.value);
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: "", general: "" }));
    }
  };

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
    // Also clear confirm password error if passwords now match
    if (confirmPassword && e.target.value === confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "", general: "" }));
    }
  };

  // Validate form before submission
  const validateForm = (
    formName,
    formEmail,
    formPassword,
    formConfirmPassword,
  ) => {
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      general: "",
    };
    let isValid = true;

    // Name validation
    if (!formName || formName.trim().length === 0) {
      newErrors.name = "Full name is required";
      isValid = false;
    } else if (formName.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
      isValid = false;
    }

    // Email validation
    if (!formEmail) {
      newErrors.email = "Email address is required";
      isValid = false;
    } else if (!validateEmail(formEmail)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation
    if (!formPassword) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formPassword.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    } else if (passwordStrength.score < 3) {
      newErrors.password = "Please choose a stronger password";
      isValid = false;
    }

    // Confirm password validation
    if (!formConfirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formPassword !== formConfirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Read from the form to be resilient to browser autofill
    const form = e.currentTarget;
    const fd = new FormData(form);
    const formName = String(fd.get("name") || name || "").trim();
    const formEmail = String(fd.get("email") || email || "").trim();
    const formPassword = String(fd.get("password") || password || "");
    const formConfirmPassword = String(
      fd.get("confirmPassword") || confirmPassword || "",
    );

    // Validate form
    if (!validateForm(formName, formEmail, formPassword, formConfirmPassword)) {
      return;
    }

    setLoading(true);
    setErrors({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      general: "",
    });

    try {
      const { account, ID } = await import("@/appwrite");

      // Check if there's an existing session and delete it first
      try {
        await account.get();
        await account.deleteSession("current");
      } catch (err) {
        // No active session, proceed with registration
      }

      await account.create(ID.unique(), formEmail, formPassword, formName);
      await account.createEmailPasswordSession(formEmail, formPassword);
      toast.success("ගිණුම සාර්ථකයි! Account created!");
      router.push("/dashboard");
    } catch (error) {
      console.error(error);

      // Parse error and show specific messages
      const errorMessage = error.message || "";

      if (
        errorMessage.includes("already exists") ||
        errorMessage.includes("already registered")
      ) {
        setErrors((prev) => ({
          ...prev,
          email:
            "An account with this email already exists. Try signing in instead.",
        }));
      } else if (errorMessage.includes("Invalid email")) {
        setErrors((prev) => ({
          ...prev,
          email: "Please enter a valid email address",
        }));
      } else if (
        errorMessage.includes("password") &&
        errorMessage.includes("weak")
      ) {
        setErrors((prev) => ({
          ...prev,
          password: "Password is too weak. Please use a stronger password.",
        }));
      } else if (
        errorMessage.includes("rate limit") ||
        errorMessage.includes("too many")
      ) {
        setErrors((prev) => ({
          ...prev,
          general:
            "Too many attempts. Please wait a few minutes and try again.",
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
          general: errorMessage || "Registration failed. Please try again.",
        }));
      }

      toast.error("Registration failed. Please check the errors below.");
    } finally {
      setLoading(false);
    }
  };

  // Password requirement check component
  const PasswordRequirement = ({ met, label }) => (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <Check className="h-4 w-4 text-emerald-500" aria-hidden="true" />
      ) : (
        <X className="h-4 w-4 text-slate-300" aria-hidden="true" />
      )}
      <span className={met ? "font-medium text-emerald-600" : "text-slate-500"}>
        {label}
      </span>
    </div>
  );

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Background */}
      <div className="live-gradient absolute inset-0 opacity-90" />
      <div className="animate-float absolute top-20 left-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="animate-float-delayed absolute right-10 bottom-20 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />

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
          <h1 className="mt-6 text-2xl font-bold text-white">
            Join Our Community
          </h1>
          <p className="mt-2 text-white/70">Create your free account</p>
        </div>

        {/* Form */}
        <div className="glass-panel relative rounded-3xl p-8 pt-14 shadow-2xl">
          {/* User Icon */}
          <div className="absolute -top-8 left-1/2 flex h-16 w-16 -translate-x-1/2 transform items-center justify-center overflow-hidden rounded-2xl bg-white shadow-xl">
            <svg
              viewBox="0 0 100 100"
              fill="none"
              className="h-12 w-12"
              aria-hidden="true"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="#E0F2FE"
                stroke="#3B82F6"
                strokeWidth="3"
              />
              <path
                d="M50 95C70 95 85 80 85 65C85 50 50 50 50 50C50 50 15 50 15 65C15 80 30 95 50 95Z"
                fill="#3B82F6"
              />
              <circle
                cx="50"
                cy="38"
                r="15"
                fill="#FDE68A"
                stroke="#F59E0B"
                strokeWidth="3"
              />
              <path
                d="M35 38C35 23 40 13 50 13C60 13 65 23 65 38"
                fill="#4B5563"
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

          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Full Name
              </label>
              <div className="relative">
                <User
                  className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="John Doe"
                  required
                  autoComplete="name"
                  aria-invalid={errors.name ? "true" : "false"}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className={`w-full rounded-2xl border-2 bg-slate-50 py-4 pr-4 pl-12 font-bold text-slate-700 transition-all outline-none focus:bg-white ${
                    errors.name
                      ? "border-red-400 focus:border-red-500"
                      : "border-transparent focus:border-[#6ee7b7]"
                  }`}
                />
              </div>
              {errors.name && (
                <p
                  id="name-error"
                  className="mt-1.5 flex items-center gap-1 text-sm font-medium text-red-600"
                  role="alert"
                >
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
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
                  autoComplete="email"
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

            {/* Password Field */}
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
                  placeholder="Create a strong password"
                  required
                  autoComplete="new-password"
                  aria-invalid={errors.password ? "true" : "false"}
                  aria-describedby="password-requirements password-error"
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

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3 space-y-2">
                  {/* Strength Bar */}
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{
                          width: `${(passwordStrength.score / 5) * 100}%`,
                        }}
                      />
                    </div>
                    <span
                      className={`text-xs font-bold capitalize ${
                        passwordStrength.strength === "strong"
                          ? "text-emerald-600"
                          : passwordStrength.strength === "medium"
                            ? "text-yellow-600"
                            : "text-red-500"
                      }`}
                    >
                      {passwordStrength.strength}
                    </span>
                  </div>

                  {/* Password Requirements */}
                  <div
                    id="password-requirements"
                    className="grid grid-cols-2 gap-1 rounded-xl bg-slate-50 p-3"
                  >
                    <PasswordRequirement
                      met={passwordStrength.checks.minLength}
                      label="8+ characters"
                    />
                    <PasswordRequirement
                      met={passwordStrength.checks.hasUppercase}
                      label="Uppercase"
                    />
                    <PasswordRequirement
                      met={passwordStrength.checks.hasLowercase}
                      label="Lowercase"
                    />
                    <PasswordRequirement
                      met={passwordStrength.checks.hasNumber}
                      label="Number"
                    />
                    <PasswordRequirement
                      met={passwordStrength.checks.hasSpecial}
                      label="Special char"
                    />
                  </div>
                </div>
              )}

              {/* Show requirements hint when password is empty */}
              {!password && (
                <p className="mt-2 text-xs text-slate-500">
                  Password must be at least 8 characters with uppercase,
                  lowercase, and numbers
                </p>
              )}

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

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  placeholder="Repeat password"
                  required
                  autoComplete="new-password"
                  aria-invalid={errors.confirmPassword ? "true" : "false"}
                  aria-describedby={
                    errors.confirmPassword
                      ? "confirm-password-error"
                      : undefined
                  }
                  className={`w-full rounded-2xl border-2 bg-slate-50 py-4 pr-12 pl-12 font-bold text-slate-700 transition-all outline-none focus:bg-white ${
                    errors.confirmPassword
                      ? "border-red-400 focus:border-red-500"
                      : confirmPassword && password === confirmPassword
                        ? "border-emerald-400 focus:border-emerald-500"
                        : "border-transparent focus:border-[#6ee7b7]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  aria-pressed={showConfirmPassword}
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>

              {/* Real-time password match indicator */}
              {confirmPassword && !errors.confirmPassword && (
                <p
                  className={`mt-1.5 flex items-center gap-1 text-sm font-medium ${
                    password === confirmPassword
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }`}
                >
                  {password === confirmPassword ? (
                    <>
                      <Check className="h-4 w-4" aria-hidden="true" />
                      Passwords match
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4" aria-hidden="true" />
                      Passwords do not match
                    </>
                  )}
                </p>
              )}

              {errors.confirmPassword && (
                <p
                  id="confirm-password-error"
                  className="mt-1.5 flex items-center gap-1 text-sm font-medium text-red-600"
                  role="alert"
                >
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-6 flex w-full items-center justify-center gap-2 py-4 text-base"
            >
              {loading ? (
                <>
                  <Loader2
                    className="h-5 w-5 animate-spin"
                    aria-hidden="true"
                  />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
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
                or sign up with
              </span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={async () => {
                try {
                  const { account } = await import("@/appwrite");
                  const { OAuthProvider } = await import("appwrite");
                  if (typeof window !== "undefined") {
                    account.createOAuth2Session(
                      OAuthProvider.Google,
                      `${window.location.origin}/dashboard`,
                      `${window.location.origin}/auth/register`,
                    );
                  }
                } catch (error) {
                  console.error("Google OAuth error:", error);
                  toast.error("Google sign up failed. Please try again.");
                }
              }}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
              aria-label="Sign up with Google"
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
              onClick={async () => {
                try {
                  const { account } = await import("@/appwrite");
                  const { OAuthProvider } = await import("appwrite");
                  if (typeof window !== "undefined") {
                    account.createOAuth2Session(
                      OAuthProvider.Facebook,
                      `${window.location.origin}/dashboard`,
                      `${window.location.origin}/auth/register`,
                    );
                  }
                } catch (error) {
                  console.error("Facebook OAuth error:", error);
                  toast.error("Facebook sign up failed. Please try again.");
                }
              }}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#1877F2] bg-[#1877F2] px-4 py-3 font-medium text-white transition-all hover:bg-[#166FE5]"
              aria-label="Sign up with Facebook"
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
            <span className="text-slate-500">Already have an account? </span>
            <Link
              href="/auth/login"
              className="font-bold text-[#10b981] hover:text-[#059669]"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Terms */}
        <div className="mt-6 text-center text-sm text-white/60">
          By signing up, you agree to our{" "}
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
