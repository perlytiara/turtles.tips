import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-turtle-lime mb-2">
          TurtlesPAC
        </h1>
        <p className="text-lg text-[var(--muted)]">
          A curated archive of ComputerCraft: Tweaked turtle and computer
          programs — with full credit to authors and links to the originals.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/programs"
          className="block p-5 rounded-lg border border-[var(--surface)] bg-[var(--surface)]/50 hover:border-turtle-green/50 transition-colors"
        >
          <h2 className="font-semibold text-turtle-lime mb-1">Programs</h2>
          <p className="text-sm text-[var(--muted)]">
            Browse by category: mining, stairs, farming, mob farm, utilities.
            All from the CC-Tweaked-TurtsAndComputers archive.
          </p>
        </Link>
        <Link
          href="/credits"
          className="block p-5 rounded-lg border border-[var(--surface)] bg-[var(--surface)]/50 hover:border-turtle-green/50 transition-colors"
        >
          <h2 className="font-semibold text-turtle-lime mb-1">Credits</h2>
          <p className="text-sm text-[var(--muted)]">
            Authors and original repos: perlytiara, Silvamord, Kaikaku,
            MerlinLikeTheWizard, and more.
          </p>
        </Link>
        <Link
          href="/docs"
          className="block p-5 rounded-lg border border-[var(--surface)] bg-[var(--surface)]/50 hover:border-turtle-green/50 transition-colors"
        >
          <h2 className="font-semibold text-turtle-lime mb-1">Docs</h2>
          <p className="text-sm text-[var(--muted)]">
            Mod docs, CC:Tweaked API, CraftOS-PC, and setup guides.
          </p>
        </Link>
        <Link
          href="/simulation"
          className="block p-5 rounded-lg border border-[var(--surface)] bg-[var(--surface)]/50 hover:border-turtle-green/50 transition-colors"
        >
          <h2 className="font-semibold text-turtle-lime mb-1">Simulation</h2>
          <p className="text-sm text-[var(--muted)]">
            A small in-browser idea of how a turtle moves and mines.
          </p>
        </Link>
      </section>

      <section className="rounded-lg border border-[var(--surface)] p-5">
        <h2 className="font-semibold mb-2">Archive</h2>
        <p className="text-sm text-[var(--muted)] mb-3">
          The program archive is the{" "}
          <a
            href="https://github.com/perlytiara/CC-Tweaked-TurtsAndComputers"
            target="_blank"
            rel="noopener noreferrer"
          >
            CC-Tweaked-TurtsAndComputers
          </a>{" "}
          repo, included here as a git submodule. To update it:
        </p>
        <pre className="text-xs bg-black/30 p-3 rounded overflow-x-auto font-mono">
          git submodule update --remote TurtlesPAC/programs
        </pre>
      </section>
    </div>
  );
}
