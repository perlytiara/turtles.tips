import { notFound } from "next/navigation";
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
  params: { path: string[] };
}

export async function generateStaticParams() {
  const allPaths = await walkAllPaths("programs");
  return allPaths.map((segments) => ({
    path: segments.slice(1),
  }));
}

export default async function ProgramsBrowsePage({ params }: Props) {
  const { path: pathSegments } = params;

  const fullSegments = ["programs", ...pathSegments];

  const pathExists = await exists(...fullSegments);
  if (!pathExists) notFound();

  const isDir = await isDirectory(...fullSegments);
  const subPath = pathSegments.join("/");
  const browseBase = "/programs";
  const rawBase = "/raw/programs";

  if (isDir) {
    const entries = await listDirectory(...fullSegments);

    const breadcrumbs = [{ label: "Programs", href: "/programs" }];
    let href = browseBase;
    for (const seg of pathSegments) {
      href += `/${seg}`;
      breadcrumbs.push({ label: seg, href });
    }

    return (
      <FileBrowser
        entries={entries}
        breadcrumbs={breadcrumbs}
        basePath={`${browseBase}/${subPath}`}
        rawBase={`${rawBase}/${subPath}`}
        title="Programs"
        description="Browse programs from the TurtlesPAC archive."
      />
    );
  }

  const content = await readFile(...fullSegments);
  const size = await getFileSize(...fullSegments);
  const filename = fullSegments[fullSegments.length - 1];

  const breadcrumbs = [{ label: "Programs", href: "/programs" }];
  let href = browseBase;
  for (const seg of pathSegments) {
    href += `/${seg}`;
    breadcrumbs.push({ label: seg, href });
  }

  return (
    <FileViewer
      content={content}
      filename={filename}
      breadcrumbs={breadcrumbs}
      rawUrl={`${rawBase}/${subPath}`}
      size={formatSize(size)}
    />
  );
}
