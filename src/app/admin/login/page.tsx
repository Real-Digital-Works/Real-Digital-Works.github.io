"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth(), email, password);
      router.replace("/admin/dashboard");
    } catch {
      setError("Incorrect email or password. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo mark */}
        <div className="mb-8 text-center">
          <span className="inline-block rounded-xl bg-[#1857EC] px-4 py-2 text-sm font-bold tracking-wide text-white">
            RDW
          </span>
          <p className="mt-3 text-[13px] text-white/40">Admin portal</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/8 bg-white/5 p-8 backdrop-blur"
        >
          <h1 className="mb-6 text-xl font-semibold text-white">Sign in</h1>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/60 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-[#1857EC] focus:ring-1 focus:ring-[#1857EC]"
                placeholder="you@realdigitalworks.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/60 uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-[#1857EC] focus:ring-1 focus:ring-[#1857EC]"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-500/15 px-4 py-2.5 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-[#1857EC] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
