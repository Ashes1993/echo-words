"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { loginUserAction } from "../../../actions/auth.js";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);
    setError("");

    const formData = new FormData(e.target);
    const result = await loginUserAction(formData);

    if (result?.error) {
      setError(result.error);
      setIsPending(false);
    }
    // If successful, NextAuth handles the redirect to /overview automatically
  };

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          Welcome back
        </h1>
        <p className="text-slate-500">
          Enter your credentials to continue learning.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-700 ml-1">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Mail size={20} />
            </div>
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none font-medium text-slate-900"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-700 ml-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Lock size={20} />
            </div>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none font-medium text-slate-900"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-brand-600 transition-colors active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
        >
          {isPending ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              Sign In <ArrowRight size={20} />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm font-medium text-slate-500">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="text-brand-600 hover:text-brand-700 hover:underline"
        >
          Create one now
        </Link>
      </p>
    </>
  );
}
