"use client";

/**
 * /auth/invite
 *
 * Branded invite redemption — invited users land here from a 7-day token link
 * and set their password directly (no Firebase oobCode).
 */

import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

type InviteCode = "invalid" | "expired" | "used" | "missing" | "error" | "password" | "rate_limited";

function messageFor(code: InviteCode | string | undefined, fallback: string) {
  switch (code) {
    case "missing":
      return "This invite link is missing a token. Ask an admin for a new invite.";
    case "invalid":
      return "This invite link is invalid. Ask an admin for a new invite.";
    case "expired":
      return "This invite link has expired. Ask an admin to send a new invite.";
    case "used":
      return "This invite has already been used. Try logging in, or ask an admin for a new invite.";
    case "rate_limited":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "password":
      return "Password must be at least 8 characters.";
    default:
      return fallback;
  }
}

function headingFor(code: InviteCode | string | undefined) {
  if (code === "expired") return "Invite expired";
  if (code === "used") return "Already used";
  return "Invalid invite";
}

function InviteHandler() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "success" | "error">("loading");
  const [errorCode, setErrorCode] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorCode("missing");
      setErrorMsg(messageFor("missing", "Invalid or expired link. Ask an admin for a new invite."));
      return;
    }

    let cancelled = false;
    fetch(`/api/auth/invite?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && data.email) {
          setEmail(data.email);
          setStatus("ready");
          return;
        }
        const code = typeof data.code === "string" ? data.code : "invalid";
        setErrorCode(code);
        setErrorMsg(messageFor(code, typeof data.error === "string" ? data.error : "This invite is not valid."));
        setStatus("error");
      })
      .catch(() => {
        if (cancelled) return;
        setErrorCode("error");
        setErrorMsg("Something went wrong. Please try again, or ask an admin for a new invite.");
        setStatus("error");
      });

    return () => { cancelled = true; };
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setErrorMsg("Passwords do not match."); return; }
    if (password.length < 8) { setErrorMsg("Password must be at least 8 characters."); return; }
    setErrorMsg("");
    setStatus("loading");
    try {
      const res = await fetch("/api/auth/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const code = typeof data.code === "string" ? data.code : "error";
        setErrorCode(code);
        if (code === "password" || code === "rate_limited") {
          setErrorMsg(messageFor(code, typeof data.error === "string" ? data.error : "Something went wrong."));
          setStatus("ready");
          return;
        }
        setErrorMsg(messageFor(code, typeof data.error === "string" ? data.error : "Something went wrong."));
        setStatus("error");
        return;
      }
      setStatus("success");
      setTimeout(() => router.replace("/admin/login"), 2500);
    } catch {
      setErrorCode("error");
      setErrorMsg("Something went wrong. Please try again, or ask an admin for a new invite.");
      setStatus("error");
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
              <h2 className="text-lg font-semibold text-white">{headingFor(errorCode)}</h2>
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

export default function AuthInvitePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#0f1117]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
      </div>
    }>
      <InviteHandler />
    </Suspense>
  );
}
