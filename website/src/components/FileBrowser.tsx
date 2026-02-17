import Link from "next/link";
import type { DirEntry } from "@/lib/files";
import { formatSize } from "@/lib/files";

interface BreadcrumbSegment {
  label: string;
  href: string;
}

interface FileBrowserProps {
  entries: DirEntry[];
  breadcrumbs: BreadcrumbSegment[];
  basePath: string;
  rawBase: string;
  title: string;
  description?: string;
}

export function FileBrowser({
  entries,
  breadcrumbs,
  basePath,
  rawBase,
  title,
  description,
}: FileBrowserProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--turtle-lime)] mb-2">
          {title}
        </h1>
        {description && <p className="text-[var(--muted)]">{description}</p>}
      </div>

      <nav className="flex items-center gap-1 text-sm font-mono overflow-x-auto pb-1">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1 shrink-0">
            {i > 0 && <span className="text-[var(--muted)]">/</span>}
            {i < breadcrumbs.length - 1 ? (
              <Link
                href={crumb.href}
                className="text-[var(--turtle-lime)] hover:underline"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-[var(--text)]">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      <section className="rounded-[var(--radius)] border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                <th className="p-3 font-semibold w-8"></th>
                <th className="p-3 font-semibold">Name</th>
                <th className="p-3 font-semibold text-right">Size</th>
                <th className="p-3 font-semibold text-right hidden sm:table-cell">
                  Download
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-6 text-center text-[var(--muted)]"
                  >
                    Empty directory
                  </td>
                </tr>
              )}
              {entries.map((entry) => {
                const href = `${basePath}/${entry.name}`;
                const rawHref = `${rawBase}/${entry.name}`;
                return (
                  <tr
                    key={entry.name}
                    className="border-b border-[var(--border)] hover:bg-[var(--surface)]/50"
                  >
                    <td className="p-3 text-center">
                      {entry.isDir ? (
                        <span title="Directory">📁</span>
                      ) : (
                        <span title="File">📄</span>
                      )}
                    </td>
                    <td className="p-3 font-mono">
                      <Link
                        href={href}
                        className="text-[var(--turtle-lime)] hover:underline"
                      >
                        {entry.name}
                        {entry.isDir ? "/" : ""}
                      </Link>
                    </td>
                    <td className="p-3 text-right text-[var(--muted)]">
                      {entry.isDir ? "—" : formatSize(entry.size)}
                    </td>
                    <td className="p-3 text-right hidden sm:table-cell">
                      {!entry.isDir && (
                        <a
                          href={rawHref}
                          className="text-xs font-mono px-2 py-1 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--turtle-lime)] hover:border-[var(--turtle-green)]"
                          title={`wget https://turtles.tips${rawHref}`}
                        >
                          raw
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4">
        <p className="text-xs text-[var(--muted)] mb-2 font-semibold uppercase tracking-wider">
          Download with wget or curl
        </p>
        <pre className="text-xs sm:text-sm bg-black/40 p-3 rounded-lg overflow-x-auto font-mono text-[var(--muted)]">
          {`wget https://turtles.tips${rawBase}/<file>\ncurl -O https://turtles.tips${rawBase}/<file>`}
        </pre>
      </div>
    </div>
  );
}
