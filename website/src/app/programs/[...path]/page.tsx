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
import {
  encodePathForHref,
  encodeSegmentsForParams,
  decodePathFromParams,
  paramVariantsForExport,
} from "@/lib/site";
import { FileBrowser } from "@/components/FileBrowser";
import { FileViewer } from "@/components/FileViewer";

interface Props {
  params: { path: string[] };
}

export async function generateStaticParams() {
  const allPaths = await walkAllPaths("programs");
  const params: { path: string[] }[] = [];
  for (const segments of allPaths) {
    const rel = segments.slice(1);
    for (const path of paramVariantsForExport(rel)) {
      params.push({ path });
    }
  }
  return params;
}

export default async function ProgramsBrowsePage({ params }: Props) {
  const pathSegments = decodePathFromParams(params.path);

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
    let prevEncoded = "";
    for (const seg of pathSegments) {
      prevEncoded = prevEncoded ? `${prevEncoded}/${encodeURIComponent(seg)}` : encodeURIComponent(seg);
      breadcrumbs.push({ label: seg, href: `${browseBase}/${prevEncoded}/` });
    }

    return (
      <FileBrowser
        entries={entries}
        breadcrumbs={breadcrumbs}
        basePath={`${browseBase}/${encodePathForHref(pathSegments)}`}
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
