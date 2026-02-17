import Link from "next/link";
import { listDirectory } from "@/lib/files";
import { FileBrowser } from "@/components/FileBrowser";

export default async function ProgramsPage() {
  let entries: Awaited<ReturnType<typeof listDirectory>> = [];
  try {
    entries = await listDirectory("programs");
  } catch {
    entries = [];
  }

  const breadcrumbs = [{ label: "Programs", href: "/programs" }];

  return (
    <div className="space-y-8">
      <FileBrowser
        entries={entries}
        breadcrumbs={breadcrumbs}
        basePath="/programs"
        rawBase="/raw/programs"
        title="Programs"
        description="Turtle and computer programs — mining, stairs, farming, utilities. Browse and download directly from TurtlesPAC."
      />

      <p className="text-sm text-[var(--muted)]">
        Looking for more?{" "}
        <Link href="/community">Community repos</Link> have additional programs from other authors.
      </p>
    </div>
  );
}
