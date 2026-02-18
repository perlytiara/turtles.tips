"use client";

import Link from "next/link";

export default function ProgramsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-6 text-center py-16">
      <h1 className="text-2xl font-bold text-[var(--turtle-lime)]">Programs — error</h1>
      <p className="text-sm text-[var(--muted)] max-w-md mx-auto">
        {error.message || "Could not load programs."}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-hover)]"
        >
          Try again
        </button>
        <Link
          href="/programs"
          className="inline-flex rounded-lg bg-[var(--turtle-green)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--turtle-lime)]"
        >
          Programs
        </Link>
      </div>
    </div>
  );
}
