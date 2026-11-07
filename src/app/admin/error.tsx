"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#070b14] px-6 text-center text-white">
      <p className="text-sm font-medium text-white/80">Admin hit an error. The public site is still available.</p>
      <p className="max-w-md text-xs text-white/40">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-xl bg-[#1857EC] px-4 py-2 text-sm font-semibold text-white"
      >
        Try again
      </button>
    </div>
  );
}
