import Link from "next/link";

export default function ProgramsGuidesIndexPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[var(--turtle-lime)]">Program guides</h1>
      <p className="text-[var(--muted)]">
        <Link href="/programs" className="text-[var(--turtle-lime)] hover:underline">
          View all programs and guides
        </Link>
      </p>
    </div>
  );
}
