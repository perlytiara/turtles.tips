import Link from "next/link";
import { communityRepos } from "@/data/community";

export default function CreditsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--turtle-lime)] mb-2">Credits</h1>
        <p className="text-[var(--muted)]">
          turtles.tips and TurtlesPAC credit all authors — programs and docs by original creators.
        </p>
      </div>

      <section className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
        <h2 className="font-semibold text-lg mb-3">Main program archive</h2>
        <p className="text-sm text-[var(--muted)] mb-2">
          The main program archive is maintained at:
        </p>
        <Link href="/programs" className="font-mono text-[var(--turtle-lime)]">
          TurtlesPAC/programs
        </Link>
        <p className="text-xs text-[var(--muted)] mt-1">
          Source: perlytiara/CC-Tweaked-TurtsAndComputers
        </p>
      </section>

      <section className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
        <h2 className="font-semibold text-lg mb-3">Community repos</h2>
        <p className="text-sm text-[var(--muted)] mb-4">
          Included in TurtlesPAC as part of the archive. Full credit to each author.
        </p>
        <ul className="space-y-2">
          {communityRepos.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/community/${c.slug}`}
                className="text-[var(--turtle-lime)] hover:underline"
              >
                {c.name}
              </Link>
              <span className="text-[var(--muted)] text-sm ml-2">
                by {c.source.split("/")[0]}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-sm text-[var(--muted)]">
        All code is available to browse and download directly from turtles.tips.
        See <Link href="/community">Community</Link> to browse files.
      </p>
    </div>
  );
}
