import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-14 sm:space-y-16">
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-[var(--turtle-lime)] tracking-tight">
          turtles.tips
        </h1>
        <p className="text-lg sm:text-xl text-[var(--muted)] leading-relaxed">
          Turtles, computers, peripherals & network — tips, programs, and docs for CC:Tweaked.
        </p>
        <p className="text-[var(--muted)] text-sm sm:text-base">
          Browse and download programs directly. No GitHub required — everything is right here.
        </p>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-4">
          Explore
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/programs"
            className="block p-6 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--turtle-green)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <h3 className="font-semibold text-[var(--turtle-lime)] mb-2">Programs</h3>
            <p className="text-sm text-[var(--muted)]">
              Main program set: mining, stairs, farming, mob farm, utilities — browse and download.
            </p>
          </Link>
          <Link
            href="/community"
            className="block p-6 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--turtle-green)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <h3 className="font-semibold text-[var(--turtle-lime)] mb-2">Community</h3>
            <p className="text-sm text-[var(--muted)]">
              Community repos: awesome-computercraft, quarry, Mastermine, and more — browse all files.
            </p>
          </Link>
          <Link
            href="/docs"
            className="block p-6 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--turtle-green)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <h3 className="font-semibold text-[var(--turtle-lime)] mb-2">Docs</h3>
            <p className="text-sm text-[var(--muted)]">
              CC:Tweaked API, CraftOS-PC, mod docs, and setup guides.
            </p>
          </Link>
          <Link
            href="/resources"
            className="block p-6 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--turtle-green)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <h3 className="font-semibold text-[var(--turtle-lime)] mb-2">Resources</h3>
            <p className="text-sm text-[var(--muted)]">
              Forums, Pastebin, Gists, and other links beyond the archive.
            </p>
          </Link>
          <Link
            href="/credits"
            className="block p-6 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--turtle-green)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <h3 className="font-semibold text-[var(--turtle-lime)] mb-2">Credits</h3>
            <p className="text-sm text-[var(--muted)]">
              Authors and original repos — perlytiara, Silvamord, Kaikaku, and more.
            </p>
          </Link>
          <Link
            href="/simulation"
            className="block p-6 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--turtle-green)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <h3 className="font-semibold text-[var(--turtle-lime)] mb-2">Simulation</h3>
            <p className="text-sm text-[var(--muted)]">
              In-browser idea of how a turtle moves and mines.
            </p>
          </Link>
        </div>
      </section>

      <section className="rounded-[var(--radius)] border border-[var(--border)] p-6 sm:p-8 bg-[var(--surface)]">
        <h2 className="font-semibold text-lg mb-2">How it works</h2>
        <p className="text-[var(--muted)] text-sm sm:text-base mb-4">
          <strong className="text-[var(--text)]">turtles.tips</strong> hosts the full TurtlesPAC archive — programs and community repos.
          Browse files in the browser or download directly with wget/curl. No GitHub needed.
        </p>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-[var(--muted)] mb-1 font-semibold uppercase tracking-wider">
              Browse a community repo
            </p>
            <pre className="text-xs sm:text-sm bg-black/40 p-3 rounded-lg overflow-x-auto font-mono text-[var(--turtle-lime)]">
              https://turtles.tips/community/starkus-quarry
            </pre>
          </div>
          <div>
            <p className="text-xs text-[var(--muted)] mb-1 font-semibold uppercase tracking-wider">
              Download a file with wget
            </p>
            <pre className="text-xs sm:text-sm bg-black/40 p-3 rounded-lg overflow-x-auto font-mono text-[var(--turtle-lime)]">
              wget https://turtles.tips/raw/community/starkus-quarry/quarry.lua
            </pre>
          </div>
          <div>
            <p className="text-xs text-[var(--muted)] mb-1 font-semibold uppercase tracking-wider">
              Or with curl
            </p>
            <pre className="text-xs sm:text-sm bg-black/40 p-3 rounded-lg overflow-x-auto font-mono text-[var(--turtle-lime)]">
              curl -O https://turtles.tips/raw/community/starkus-quarry/quarry.lua
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
