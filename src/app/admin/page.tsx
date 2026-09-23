"use client";

/**
 * /admin — entry point.
 * Checks auth state and routes to login or dashboard.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, firebaseConfigured } from "@/lib/firebase";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    if (!firebaseConfigured) {
      // Firebase not yet set up — show setup notice, no redirect
      return;
    }

    const unsub = onAuthStateChanged(auth(), (user) => {
      if (user) {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/admin/login");
      }
    });
    return unsub;
  }, [router]);

  if (!firebaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="max-w-md rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-8 text-center">
          <div className="mb-4 text-4xl">⚙️</div>
          <h1 className="text-xl font-semibold text-yellow-300">Firebase not configured</h1>
          <p className="mt-3 text-sm text-yellow-200/70">
            Add your Firebase environment variables to <code className="rounded bg-white/10 px-1">.env.local</code> (local) or Vercel dashboard (production), then redeploy.
          </p>
          <div className="mt-6 rounded-xl bg-black/30 p-4 text-left font-mono text-xs text-yellow-100/60 leading-relaxed">
            NEXT_PUBLIC_FIREBASE_API_KEY=…<br />
            NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=…<br />
            NEXT_PUBLIC_FIREBASE_PROJECT_ID=…<br />
            NEXT_PUBLIC_FIREBASE_APP_ID=…
          </div>
          <p className="mt-4 text-xs text-yellow-200/50">
            See <strong>.env.example</strong> in the repo root for the full list.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
    </div>
  );
}
