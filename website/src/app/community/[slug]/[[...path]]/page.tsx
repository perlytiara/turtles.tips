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
import { FileBrowser } from "@/components/FileBrowser";
import { FileViewer } from "@/components/FileViewer";

interface Props {
  params: { slug: string; path?: string[] };
}

export async function generateStaticParams() {
  const params: { slug: string; path?: string[] }[] = [];

  for (const repo of communityRepos) {
    params.push({ slug: repo.slug });

    const allPaths = await walkAllPaths("community", repo.slug);
    for (const segments of allPaths) {
      const relativePath = segments.slice(2);
      if (relativePath.length > 0) {
        params.push({ slug: repo.slug, path: relativePath });
      }
    }
  }

  return params;
}

export default async function CommunityBrowsePage({ params }: Props) {
  const { slug, path: pathSegments } = params;

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
      let href = browseBase;
      for (const seg of pathSegments) {
        href += `/${seg}`;
        breadcrumbs.push({ label: seg, href });
      }
    }

    return (
      <FileBrowser
        entries={entries}
        breadcrumbs={breadcrumbs}
        basePath={subPath ? `${browseBase}/${subPath}` : browseBase}
        rawBase={subPath ? `${rawBase}/${subPath}` : rawBase}
        title={repo.name}
        description={`Community repo by ${repo.source.split("/")[0]} — browse files and download with wget/curl.`}
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
    let href = browseBase;
    for (let i = 0; i < pathSegments.length; i++) {
      href += `/${pathSegments[i]}`;
      breadcrumbs.push({ label: pathSegments[i], href });
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
