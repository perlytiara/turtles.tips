import Link from "next/link";
import { listDirectory } from "@/lib/files";
import { communityRepos } from "@/data/community";

export default async function CreditsPage() {
  let programAuthors: { name: string }[] = [];
  try {
    const entries = await listDirectory("programs");
    programAuthors = entries.filter((e) => e.isDir).map((e) => ({ name: e.name }));
  } catch {
    // ignore
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--turtle-lime)] mb-2">Credits</h1>
        <p className="text-[var(--muted)]">
          turtles.tips and TurtlesPAC credit all authors — programs and docs by original creators.
        </p>
        <p className="text-sm text-[var(--muted)] mt-2">
          Files on this site are forked copies of the originals. Our versions may have issues or differ; they are sometimes kept only to work on something further or fix a bug.
        </p>
      </div>

      <section className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
        <h2 className="font-semibold text-lg mb-3">Main program archive</h2>
        <p className="text-sm text-[var(--muted)] mb-2">
          The main program archive is maintained at:
        </p>
        <Link href="/programs" className="font-mono text-[var(--turtle-lime)] hover:underline">
          TurtlesPAC/programs
        </Link>
        <p className="text-xs text-[var(--muted)] mt-1 mb-4">
          Source: perlytiara/CC-Tweaked-TurtsAndComputers
        </p>
        {programAuthors.length > 0 && (
          <>
            <p className="text-sm text-[var(--muted)] mb-2">
              Names in the programs folder (credit to each):
            </p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-mono">
              {programAuthors.map((a) => (
                <li key={a.name}>
                  <Link
                    href={`/programs/${encodeURIComponent(a.name)}`}
                    className="text-[var(--turtle-lime)] hover:underline"
                  >
                    {a.name}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
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
