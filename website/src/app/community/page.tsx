import Link from "next/link";
import { communityRepos } from "@/data/community";
import { siteUrl } from "@/lib/site";

export default function CommunityPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--turtle-lime)] mb-2">Community</h1>
        <p className="text-[var(--muted)]">
          Community repos — turtles, computers, and peripherals from the community. Browse files directly and download with wget.
        </p>
      </div>

      <section className="rounded-[var(--radius)] border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                <th className="p-3 font-semibold">Repo</th>
                <th className="p-3 font-semibold">Author</th>
                <th className="p-3 font-semibold text-right hidden sm:table-cell">Browse</th>
              </tr>
            </thead>
            <tbody>
              {communityRepos.map((c) => (
                <tr key={c.slug} className="border-b border-[var(--border)] hover:bg-[var(--surface)]/50">
                  <td className="p-3 font-mono text-[var(--turtle-lime)]">
                    <Link href={`/community/${c.slug}`}>
                      {c.name}
                    </Link>
                  </td>
                  <td className="p-3 text-[var(--muted)]">{c.source.split("/")[0]}</td>
                  <td className="p-3 text-right hidden sm:table-cell">
                    <Link
                      href={`/community/${c.slug}`}
                      className="text-xs font-mono px-2 py-1 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--turtle-lime)] hover:border-[var(--turtle-green)]"
                    >
                      files
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4">
        <p className="text-xs text-[var(--muted)] mb-2 font-semibold uppercase tracking-wider">
          Download any file directly
        </p>
        <pre className="text-xs sm:text-sm bg-black/40 p-3 rounded-lg overflow-x-auto font-mono text-[var(--turtle-lime)]">
          {`wget ${siteUrl}/raw/community/<repo>/<file>`}
        </pre>
      </div>
    </div>
  );
}
