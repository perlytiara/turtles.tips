"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { siteBasePath, siteUrl } from "@/lib/site";
import { CopyCommand } from "./CopyCommand";
import { extractLuaMetadata } from "@/lib/metadata";

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
  const meta = extractLuaMetadata(content);
  const fullRawUrl = `${siteUrl}${rawUrl}`;
  const wgetCmd = `wget ${fullRawUrl}`;

  const [showScrollDown, setShowScrollDown] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 1500);
    } catch {
      setCodeCopied(false);
    }
  };

  useEffect(() => {
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setShowScrollDown(scrollable > 200 && window.scrollY < scrollable - 100);
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
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

      {/* Top: Copy commands + metadata */}
      <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-mono font-semibold text-[var(--text)] text-lg">
                {filename}
              </h2>
              <p className="text-sm text-[var(--muted)] mt-0.5">
                {lineCount} lines · {size}
                {meta.version && ` · ${meta.version}`}
              </p>
            </div>
            <a
              href={siteBasePath ? `${siteBasePath}${rawUrl}` : rawUrl}
              className="shrink-0 text-xs font-mono px-3 py-1.5 rounded-lg bg-[var(--turtle-green)] text-white hover:bg-[var(--turtle-lime)] transition-colors"
            >
              Open raw
            </a>
          </div>

          {meta.description && (
            <p className="text-sm text-[var(--muted)]">{meta.description}</p>
          )}
          {meta.usage && (
            <p className="text-xs text-[var(--muted)]">
              <span className="font-semibold text-[var(--text)]">Usage:</span> {meta.usage}
            </p>
          )}

          <div className="space-y-2 pt-2 border-t border-[var(--border)]">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Copy & run
            </p>
            <CopyCommand command={wgetCmd} />
          </div>
        </div>
      </div>

      {/* Code block */}
      <div className="relative rounded-[var(--radius)] border border-[var(--border)] overflow-hidden">
        <button
          type="button"
          onClick={copyCode}
          className="absolute top-3 right-3 z-10 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--surface)]/90 border border-[var(--border)] text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--turtle-lime)] hover:border-[var(--turtle-green)]"
          title="Copy code to clipboard"
        >
          {codeCopied ? "Copied" : "Copy code"}
        </button>
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

      {/* Floating scroll-to-bottom button */}
      {showScrollDown && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="fixed bottom-6 right-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] shadow-lg transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--turtle-lime)] hover:border-[var(--turtle-green)]"
          title="Scroll to bottom"
        >
          <span className="sr-only">Scroll to bottom</span>
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
