import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-6 text-center py-16">
      <h1 className="text-4xl font-bold text-[var(--turtle-lime)]">404</h1>
      <p className="text-[var(--muted)]">Page not found.</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--turtle-green)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--turtle-lime)]"
      >
        Back to home
      </Link>
    </div>
  );
}
