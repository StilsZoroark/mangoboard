"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { loginWithCredentials, registerWithCredentials } from "@app/lib/authActions";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = mode === "signin"
        ? await loginWithCredentials(undefined, formData)
        : await registerWithCredentials(undefined, formData);

      if (result) {
        setError(result);
        setLoading(false);
      }
    } catch {
      // In Next.js Server Actions, a redirect throws an error which handles router changes automatically
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-yellow-50 dark:bg-zinc-950 px-4 transition-colors duration-200">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.06),transparent_60%)] dark:bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.02),transparent_60%)]" />

      <div className="relative w-full max-w-md rounded-3xl border border-orange-300/35 dark:border-orange-400/20 bg-[#fffaf0] dark:bg-[#150b0a] p-8 shadow-xl overflow-hidden animate-[dropIn_0.25s_ease-out]">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-amber-100/35 to-transparent opacity-70 dark:from-amber-950/10" />

        <div className="text-center mb-6 relative">
          <Link href="/" className="inline-block text-3xl font-extrabold text-orange-600 dark:text-orange-500 hover:opacity-90 transition-opacity mb-2">
            Mangoboard
          </Link>
          <h2 className="text-xl font-bold text-orange-950 dark:text-orange-100">
            {mode === "signin" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            {mode === "signin"
              ? "Sign in to track your stock portfolio and personalize your feed."
              : "Register to unlock portfolio features and custom news feeds."}
          </p>
        </div>

        {/* Tab mode toggler */}
        <div className="relative flex p-1 mb-6 bg-orange-100/40 dark:bg-zinc-900/40 rounded-xl border border-orange-200/30 dark:border-orange-900/20">
          <button
            onClick={() => { setMode("signin"); setError(""); }}
            className={`flex-1 text-center py-2 text-sm font-semibold rounded-lg transition-all ${mode === "signin"
                ? "bg-white dark:bg-[#1f100e] text-orange-950 dark:text-orange-100 shadow-sm"
                : "text-black/60 dark:text-white/60 hover:text-orange-950 dark:hover:text-white"
              }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode("signup"); setError(""); }}
            className={`flex-1 text-center py-2 text-sm font-semibold rounded-lg transition-all ${mode === "signup"
                ? "bg-white dark:bg-[#1f100e] text-orange-950 dark:text-orange-100 shadow-sm"
                : "text-black/60 dark:text-white/60 hover:text-orange-950 dark:hover:text-white"
              }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="relative mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-bold text-orange-800 dark:text-orange-400 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder="John Doe"
                className="w-full rounded-xl border border-orange-300/40 dark:border-orange-500/10 bg-white dark:bg-[#1f100e] px-4 py-2.5 text-sm text-orange-950 dark:text-orange-100 shadow-sm focus:border-orange-500 focus:outline-none transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-orange-800 dark:text-orange-400 uppercase tracking-wider mb-1">
              {mode === "signin" ? "Email or Phone" : "Email Address"}
            </label>
            <input
              name={mode === "signin" ? "emailOrPhone" : "email"}
              type={mode === "signin" ? "text" : "email"}
              required
              placeholder={mode === "signin" ? "email@example.com or phone" : "email@example.com"}
              className="w-full rounded-xl border border-orange-300/40 dark:border-orange-500/10 bg-white dark:bg-[#1f100e] px-4 py-2.5 text-sm text-orange-950 dark:text-orange-100 shadow-sm focus:border-orange-500 focus:outline-none transition"
            />
          </div>

          {mode === "signup" && (
            <div>
              <label className="block text-xs font-bold text-orange-800 dark:text-orange-400 uppercase tracking-wider mb-1">
                Phone Number (Optional)
              </label>
              <input
                name="phone"
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                className="w-full rounded-xl border border-orange-300/40 dark:border-orange-500/10 bg-white dark:bg-[#1f100e] px-4 py-2.5 text-sm text-orange-950 dark:text-orange-100 shadow-sm focus:border-orange-500 focus:outline-none transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-orange-800 dark:text-orange-400 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-orange-300/40 dark:border-orange-500/10 bg-white dark:bg-[#1f100e] px-4 py-2.5 text-sm text-orange-950 dark:text-orange-100 shadow-sm focus:border-orange-500 focus:outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 shadow-md hover:shadow-lg transition cursor-pointer text-sm disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : mode === "signin" ? (
              "Sign In with Credentials"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-orange-300/20 dark:border-orange-500/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase font-bold tracking-wider">
            <span className="bg-[#fffaf0] dark:bg-[#150b0a] px-3 text-black/40 dark:text-white/40">Or continue with</span>
          </div>
        </div>

        {/* Google OAuth Login */}
        <div className="space-y-3 relative">
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-orange-300/50 dark:border-orange-500/20 bg-white dark:bg-[#1f100e] px-4 py-3.5 text-sm font-semibold text-orange-950 dark:text-orange-100 shadow-[0_2px_8px_rgba(200,90,0,0.05)] hover:bg-orange-500/10 dark:hover:bg-orange-500/15 hover:border-orange-300/70 hover:shadow-[0_4px_16px_rgba(200,90,0,0.1)] transition-all duration-150 active:translate-y-0 hover:-translate-y-0.5 transform-gpu cursor-pointer"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continue with Google
          </button>
        </div>

        <div className="mt-8 text-center relative">
          <Link href="/" className="text-xs font-semibold text-orange-700 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 hover:underline transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
