import Link from "next/link";

interface BreadcrumbSegment {
  label: string;
  href: string;
}

interface FileViewerProps {
  content: string;
  filename: string;
  breadcrumbs: BreadcrumbSegment[];
  rawUrl: string;
  size: string;
}

export function FileViewer({
  content,
  filename,
  breadcrumbs,
  rawUrl,
  size,
}: FileViewerProps) {
  const lines = content.split("\n");
  const lineCount = lines.length;

  return (
    <div className="space-y-6">
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

      <div className="rounded-[var(--radius)] border border-[var(--border)] overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-4 py-3 bg-[var(--surface)] border-b border-[var(--border)]">
          <div className="flex items-center gap-3 text-sm">
            <span className="font-mono font-semibold text-[var(--text)]">
              {filename}
            </span>
            <span className="text-[var(--muted)]">
              {lineCount} lines · {size}
            </span>
          </div>
          <a
            href={rawUrl}
            className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg bg-[var(--turtle-green)] text-white hover:bg-[var(--turtle-lime)] transition-colors"
          >
            Raw
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <tbody>
              {lines.map((line, i) => (
                <tr key={i} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-0 text-right select-none text-[var(--muted)]/50 w-12 text-xs leading-6 border-r border-[var(--border)]">
                    {i + 1}
                  </td>
                  <td className="px-4 py-0 whitespace-pre text-[var(--text)] leading-6">
                    {line}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
        <p className="text-xs text-[var(--muted)] font-semibold uppercase tracking-wider">
          Download this file
        </p>
        <pre className="text-xs sm:text-sm bg-black/40 p-3 rounded-lg overflow-x-auto font-mono text-[var(--turtle-lime)]">
          {`wget https://turtles.tips${rawUrl}`}
        </pre>
        <pre className="text-xs sm:text-sm bg-black/40 p-3 rounded-lg overflow-x-auto font-mono text-[var(--turtle-lime)]">
          {`curl -O https://turtles.tips${rawUrl}`}
        </pre>
      </div>
    </div>
  );
}
