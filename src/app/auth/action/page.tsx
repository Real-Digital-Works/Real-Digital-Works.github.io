"use client";

/**
 * /auth/action
 *
 * Firebase Auth action handler — handles the link the invited user clicks.
 * Firebase redirects here when:
 *   ?mode=resetPassword  → invited user setting their password for the first time
 *
 * To activate: Firebase Console → Authentication → Templates →
 *   Password reset → Action URL → set to https://realdigitalworks.com/auth/action
 */

import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Suspense } from "react";

function ActionHandler() {
  const params = useSearchParams();
  const router = useRouter();

  const mode = params.get("mode");
  const oobCode = params.get("oobCode");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  // Verify the code is valid before showing the form
  useEffect(() => {
    if (!oobCode || mode !== "resetPassword") {
      setStatus("error");
      setErrorMsg("Invalid or expired link. Ask an admin for a new invite.");
      return;
    }
    verifyPasswordResetCode(auth(), oobCode)
      .then((email) => { setEmail(email); setStatus("ready"); })
      .catch(() => { setStatus("error"); setErrorMsg("This link has expired or already been used. Ask an admin to send a new invite."); });
  }, [oobCode, mode]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setErrorMsg("Passwords do not match."); return; }
    if (password.length < 8) { setErrorMsg("Password must be at least 8 characters."); return; }
    setErrorMsg("");
    setStatus("loading");
    try {
      await confirmPasswordReset(auth(), oobCode!, password);
      setStatus("success");
      setTimeout(() => router.replace("/admin/login"), 2500);
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. The link may have expired — ask for a new invite.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1117] p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="inline-block rounded-xl bg-[#1857EC] px-4 py-2 text-sm font-bold tracking-wide text-white">
            RDW
          </span>
          <p className="mt-3 text-sm text-white/40">Real Digital Works · Admin</p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/5 p-8 backdrop-blur">
          {status === "loading" && (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
            </div>
          )}

          {status === "ready" && (
            <>
              <h1 className="mb-1 text-xl font-semibold text-white">Set your password</h1>
              <p className="mb-6 text-sm text-white/45">
                You were invited as <strong className="text-white/70">{email}</strong>. Choose a password to activate your account.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/50">
                    New password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#1857EC] focus:ring-1 focus:ring-[#1857EC]"
                    placeholder="At least 8 characters"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/50">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#1857EC] focus:ring-1 focus:ring-[#1857EC]"
                    placeholder="Same password again"
                  />
                </div>
                {errorMsg && (
                  <p className="rounded-lg bg-red-500/15 px-4 py-2.5 text-sm text-red-300">{errorMsg}</p>
                )}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#1857EC] py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
                >
                  Activate account
                </button>
              </form>
            </>
          )}

          {status === "success" && (
            <div className="py-4 text-center">
              <div className="mb-4 text-4xl">✓</div>
              <h2 className="text-lg font-semibold text-white">Password set</h2>
              <p className="mt-2 text-sm text-white/50">Redirecting you to the admin login…</p>
            </div>
          )}

          {status === "error" && (
            <div className="py-4 text-center">
              <div className="mb-4 text-4xl">⚠️</div>
              <h2 className="text-lg font-semibold text-white">Link expired</h2>
              <p className="mt-2 text-sm text-white/50">{errorMsg}</p>
              <button
                onClick={() => router.replace("/admin/login")}
                className="mt-6 text-sm text-[#60a5fa] hover:underline"
              >
                Go to login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthActionPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#0f1117]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
      </div>
    }>
      <ActionHandler />
    </Suspense>
  );
}
