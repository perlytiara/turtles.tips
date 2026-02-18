import { notFound } from "next/navigation";
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

export async function generateStaticParams(): Promise<{ slug: string; path?: string[] }[]> {
  const params: { slug: string; path?: string[] }[] = [];

  try {
    for (const repo of communityRepos) {
      params.push({ slug: repo.slug });

      const allPaths = await walkAllPaths("community", repo.slug);
      for (const segments of allPaths) {
        const relativePath = segments.slice(2);
        if (relativePath.length > 0) {
          for (const path of paramVariantsForExport(relativePath)) {
            params.push({ slug: repo.slug, path });
          }
        }
      }
    }
  } catch {
    // CI or env without TurtlesPAC: export at least repo index pages
    for (const repo of communityRepos) {
      params.push({ slug: repo.slug });
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
