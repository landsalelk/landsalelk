"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { account } from "@/appwrite";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function VerifyMagicLink() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [error, setError] = useState("");

  const verifyMagicLink = useCallback(async () => {
    try {
      const userId = searchParams.get("userId");
      const secret = searchParams.get("secret");

      if (!userId || !secret) {
        setStatus("error");
        setError("Invalid magic link. Please request a new one.");
        return;
      }

      // Create session from magic URL
      await account.createSession(userId, secret);

      setStatus("success");

      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Magic link verification error:", err);
      setStatus("error");
      setError(
        err.message || "Failed to verify magic link. It may have expired.",
      );
    }
  }, [searchParams, router]);

  useEffect(() => {
    verifyMagicLink();
  }, [verifyMagicLink]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        {status === "verifying" && (
          <>
            <Loader2 className="mx-auto mb-6 h-16 w-16 animate-spin text-emerald-600" />
            <h1 className="mb-2 text-2xl font-bold text-gray-800">
              Verifying Magic Link...
            </h1>
            <p className="text-gray-600">Please wait while we sign you in.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-800">
              Welcome Back!
            </h1>
            <p className="text-gray-600">
              You&apos;ve been signed in successfully. Redirecting to
              dashboard...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-800">
              Verification Failed
            </h1>
            <p className="mb-6 text-gray-600">{error}</p>
            <div className="space-y-3">
              <a
                href="/auth/magic-link"
                className="block w-full rounded-xl bg-emerald-600 py-3 text-white transition-colors hover:bg-emerald-700"
              >
                Request New Magic Link
              </a>
              <a
                href="/auth/login"
                className="block w-full rounded-xl border border-gray-200 py-3 text-gray-600 transition-colors hover:bg-gray-50"
              >
                Login with Password
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyMagicLinkPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
          <Loader2 className="h-16 w-16 animate-spin text-emerald-600" />
        </div>
      }
    >
      <VerifyMagicLink />
    </Suspense>
  );
}
