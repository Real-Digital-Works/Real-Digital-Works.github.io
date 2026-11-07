"use client";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-medium">Something went wrong on this page.</p>
      <p className="max-w-md text-xs opacity-60">{error.message}</p>
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
