"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { siteBasePath } from "@/lib/site";

type GuideEntry = {
  id: string;
  slug: string;
  title: string;
  author: string;
  category: string;
  imageMainPath?: string | null;
  videoThumbnailUrl?: string | null;
  videoPublishedAt?: string | null;
  summary?: string | null;
  metaDescription?: string | null;
  videoDescription?: string | null;
  programPaths?: string[];
};

type SearchIndexEntry = {
  slug: string;
  title: string;
  author: string;
  category: string;
  paths: string[];
  codeExcerpt: string;
};

const CATEGORY_ORDER = ["mining", "farming", "building", "utilities", "_"];
const CATEGORY_LABELS: Record<string, string> = {
  mining: "Mining",
  farming: "Farming",
  building: "Building",
  utilities: "Utilities",
  _: "Other",
};

type SortMode = "recent" | "category";

interface ProgramGuidesSectionProps {
  entries: GuideEntry[];
  categoryLabels: Record<string, string>;
}

export function ProgramGuidesSection({ entries, categoryLabels }: ProgramGuidesSectionProps) {
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("category");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [searchIndex, setSearchIndex] = useState<SearchIndexEntry[] | null>(null);

  useEffect(() => {
    fetch((siteBasePath || "") + "/programs/search-index.json")
      .then((r) => (r.ok ? r.json() : null))
      .then(setSearchIndex)
      .catch(() => setSearchIndex(null));
  }, []);

  const filteredByQuery = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) => {
      if (e.title?.toLowerCase().includes(q)) return true;
      if (e.slug?.toLowerCase().includes(q)) return true;
      if (e.author?.toLowerCase().includes(q)) return true;
      if (e.category?.toLowerCase().includes(q)) return true;
      if (e.programPaths?.some((p) => p.toLowerCase().includes(q))) return true;
      const idx = searchIndex?.find((i) => i.slug === e.slug);
      if (idx?.codeExcerpt?.toLowerCase().includes(q)) return true;
      return false;
    });
  }, [entries, query, searchIndex]);

  const filteredByCategory = useMemo(() => {
    const map = new Map<string, GuideEntry[]>();
    for (const e of filteredByQuery) {
      const cat = e.category || "utilities";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(e);
    }
    return map;
  }, [filteredByQuery]);

  const sortedRecent = useMemo(() => {
    return [...filteredByQuery].sort((a, b) => {
      const da = a.videoPublishedAt ? new Date(a.videoPublishedAt).getTime() : 0;
      const db = b.videoPublishedAt ? new Date(b.videoPublishedAt).getTime() : 0;
      return db - da;
    });
  }, [filteredByQuery]);

  const toggleCollapse = (catId: string) => {
    setCollapsed((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] shrink-0">
          Program guides
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            placeholder="Search title, path, code…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 min-w-[180px] px-3 py-1.5 text-sm font-mono rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--turtle-green)]"
            aria-label="Search programs"
          />
          <span className="text-xs text-[var(--muted)]">Sort:</span>
          <button
            type="button"
            onClick={() => setSortMode("category")}
            className={`text-xs px-2 py-1 rounded border ${sortMode === "category" ? "border-[var(--turtle-green)] text-[var(--turtle-lime)]" : "border-[var(--border)] text-[var(--muted)]"}`}
          >
            By category
          </button>
          <button
            type="button"
            onClick={() => setSortMode("recent")}
            className={`text-xs px-2 py-1 rounded border ${sortMode === "recent" ? "border-[var(--turtle-green)] text-[var(--turtle-lime)]" : "border-[var(--border)] text-[var(--muted)]"}`}
          >
            Most recent
          </button>
        </div>
      </div>

      {sortMode === "recent" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedRecent.map((entry) => (
            <GuideCard key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        CATEGORY_ORDER.map((catId) => {
          const items = filteredByCategory.get(catId);
          if (!items?.length) return null;
          const label = CATEGORY_LABELS[catId] ?? categoryLabels[catId] ?? catId;
          const isCollapsed = collapsed[catId];
          return (
            <div key={catId}>
              <button
                type="button"
                onClick={() => toggleCollapse(catId)}
                className="flex items-center gap-2 w-full text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3 hover:text-[var(--turtle-lime)]"
                aria-expanded={!isCollapsed}
              >
                <span className="shrink-0 transition-transform inline-block" style={{ transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)" }}>
                  ▸
                </span>
                {label}
                <span className="text-[var(--muted)] font-normal">({items.length})</span>
              </button>
              {!isCollapsed && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((entry) => (
                    <GuideCard key={entry.id} entry={entry} />
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}

      {filteredByQuery.length === 0 && (
        <p className="text-sm text-[var(--muted)]">No programs match your search.</p>
      )}
    </section>
  );
}

function GuideCard({ entry }: { entry: GuideEntry }) {
  const thumb =
    entry.imageMainPath != null
      ? (siteBasePath || "") + entry.imageMainPath
      : entry.videoThumbnailUrl;
  return (
    <Link
      href={`/programs/guides/${entry.slug}`}
      className="block p-5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--turtle-green)] hover:bg-[var(--surface-hover)] transition-colors"
    >
      <div className="flex gap-3">
        {thumb ? (
          <img
            src={thumb}
            alt=""
            className="w-24 h-16 object-cover rounded shrink-0 bg-[var(--border)]"
          />
        ) : (
          <div className="w-24 h-16 rounded shrink-0 bg-[var(--border)] flex items-center justify-center text-[var(--muted)] text-2xl">
            ▶
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-[var(--turtle-lime)] truncate">
            {entry.title || entry.slug}
          </h3>
          <p className="text-xs text-[var(--muted)] mt-0.5 line-clamp-2">
            {entry.summary ||
              entry.metaDescription ||
              entry.videoDescription?.slice(0, 120) ||
              entry.author}
          </p>
        </div>
      </div>
    </Link>
  );
}
