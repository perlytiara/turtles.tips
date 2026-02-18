import Link from "next/link";
import { listDirectory } from "@/lib/files";
import { FileBrowser } from "@/components/FileBrowser";
import { getProgramsManifest, getProgramsCategories } from "@/lib/programs-content";
import { ProgramGuidesSection } from "@/components/ProgramGuidesSection";

export default async function ProgramsPage() {
  const [manifest, categories, entries] = await Promise.all([
    getProgramsManifest(),
    getProgramsCategories(),
    listDirectory("programs").catch(() => []),
  ]);

  const categoryLabels = Object.fromEntries(
    categories.sort((a, b) => a.order - b.order).map((c) => [c.id, c.label])
  );
  const guideEntries = manifest.map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    author: e.author,
    category: e.category || "utilities",
    imageMainPath: e.imageMainPath ?? null,
    videoThumbnailUrl: e.videoThumbnailUrl ?? null,
    videoPublishedAt: e.videoPublishedAt ?? null,
    summary: e.summary ?? null,
    metaDescription: e.metaDescription ?? null,
    videoDescription: e.videoDescription ?? null,
    programPaths: e.programPaths ?? [],
  }));

  const breadcrumbs = [{ label: "Programs", href: "/programs" }];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-[var(--turtle-lime)] mb-2">Programs</h1>
        <p className="text-[var(--muted)]">
          Turtle and computer programs — guides with videos, then browse and download from TurtlesPAC.
        </p>
        <p className="text-sm text-[var(--muted)] mt-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-3">
          All files in these folders are forked and hosted on this site. Full credit goes to the original authors. Our copies may have issues or differ — they are sometimes kept only to work on something further or fix a bug.
        </p>
      </div>

      {manifest.length > 0 && (
        <ProgramGuidesSection entries={guideEntries} categoryLabels={categoryLabels} />
      )}

      <section id="browse" className="space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          Browse all files
        </h2>
        <FileBrowser
          entries={entries}
          breadcrumbs={breadcrumbs}
          basePath="/programs"
          rawBase="/raw/programs"
          title="Files"
          description="Download any file with wget or curl. No GitHub required."
        />
      </section>

      <p className="text-sm text-[var(--muted)]">
        Looking for more?{" "}
        <Link href="/community" className="text-[var(--turtle-lime)] hover:underline">
          Community repos
        </Link>{" "}
        have additional programs from other authors.
      </p>
    </div>
  );
}
