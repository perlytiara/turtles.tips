import { notFound } from "next/navigation";
import path from "path";
import fs from "fs/promises";
import { communityRepos } from "@/data/community";
import {
  listDirectory,
  readFile,
  getFileSize,
  exists,
  isDirectory,
  formatSize,
  walkAllPaths,
} from "@/lib/files";
import {
  encodePathForHref,
  encodeSegmentsForParams,
  decodePathFromParams,
  paramVariantsForExport,
} from "@/lib/site";
import { FileBrowser } from "@/components/FileBrowser";
import { FileViewer } from "@/components/FileViewer";

interface Props {
  params: { slug: string; path?: string[] };
}

/** List all paths under public/raw/community/{slug} (used when TurtlesPAC is not available, e.g. CI). Returns same shape as walkAllPaths: [["community", slug, ...rest]]. */
async function walkRawCommunityPaths(slug: string): Promise<string[][]> {
  const rawDir = path.join(process.cwd(), "public", "raw", "community", slug);
  const results: string[][] = [];
  try {
    await recurse(rawDir, ["community", slug]);
  } catch {
    return results;
  }
  return results;

  async function recurse(dir: string, segments: string[]) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const childSegments = [...segments, entry.name];
      results.push(childSegments);
      if (entry.isDirectory()) {
        await recurse(path.join(dir, entry.name), childSegments);
      }
    }
  }
}

export async function generateStaticParams(): Promise<{ slug: string; path: string[] }[]> {
  const params: { slug: string; path: string[] }[] = [];

  for (const repo of communityRepos) {
    params.push({ slug: repo.slug, path: [] });

    let paths: string[][];
    try {
      paths = await walkAllPaths("community", repo.slug);
    } catch {
      paths = await walkRawCommunityPaths(repo.slug);
    }
    for (const segments of paths) {
      const relativePath = segments.slice(2);
      if (relativePath.length > 0) {
        for (const pathVariant of paramVariantsForExport(relativePath)) {
          params.push({ slug: repo.slug, path: pathVariant });
        }
      }
    }
  }

  return params;
}

export default async function CommunityBrowsePage({ params }: Props) {
  const slug = params.slug;
  const pathSegments = params.path ? decodePathFromParams(params.path) : [];

  const repo = communityRepos.find((r) => r.slug === slug);
  if (!repo) notFound();

  const baseSegments = ["community", slug];
  const fullSegments = [...baseSegments, ...(pathSegments || [])];

  const pathExists = await exists(...fullSegments);
  if (!pathExists) notFound();

  const isDir = await isDirectory(...fullSegments);
  const subPath = pathSegments?.join("/") || "";
  const browseBase = `/community/${slug}`;
  const rawBase = `/raw/community/${slug}`;

  if (isDir) {
    const entries = await listDirectory(...fullSegments);

    const breadcrumbs = [
      { label: "Community", href: "/community" },
      { label: repo.name, href: browseBase },
    ];
    if (pathSegments) {
      let prevEncoded = "";
      for (const seg of pathSegments) {
        prevEncoded = prevEncoded ? `${prevEncoded}/${encodeURIComponent(seg)}` : encodeURIComponent(seg);
        breadcrumbs.push({ label: seg, href: `${browseBase}/${prevEncoded}/` });
      }
    }

    return (
      <FileBrowser
        entries={entries}
        breadcrumbs={breadcrumbs}
        basePath={subPath ? `${browseBase}/${encodePathForHref(pathSegments)}` : browseBase}
        rawBase={subPath ? `${rawBase}/${subPath}` : rawBase}
        title={repo.name}
        description={`Community repo by ${repo.source.split("/")[0]} — browse files and download with wget.`}
      />
    );
  }

  const content = await readFile(...fullSegments);
  const size = await getFileSize(...fullSegments);
  const filename = fullSegments[fullSegments.length - 1];

  const breadcrumbs = [
    { label: "Community", href: "/community" },
    { label: repo.name, href: browseBase },
  ];
  if (pathSegments) {
    let prevEncoded = "";
    for (let i = 0; i < pathSegments.length; i++) {
      const seg = pathSegments[i];
      prevEncoded = prevEncoded ? `${prevEncoded}/${encodeURIComponent(seg)}` : encodeURIComponent(seg);
      const isLast = i === pathSegments.length - 1;
      breadcrumbs.push({
        label: seg,
        href: isLast ? `${browseBase}/${prevEncoded}` : `${browseBase}/${prevEncoded}/`,
      });
    }
  }

  const rawUrl = `/raw/community/${slug}/${subPath}`;

  return (
    <FileViewer
      content={content}
      filename={filename}
      breadcrumbs={breadcrumbs}
      rawUrl={rawUrl}
      size={formatSize(size)}
    />
  );
}
