import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProgramsManifest,
  getArticleBySlugFromManifest,
  getArticleBody,
  getRelatedProgramLinks,
  getSuggestedGuides,
} from "@/lib/programs-content";
import { siteUrl, siteBasePath } from "@/lib/site";
import { ArticleBody } from "@/components/ArticleBody";
import { CopyCommand } from "@/components/CopyCommand";
import { ImageLightbox } from "@/components/ImageLightbox";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const manifest = await getProgramsManifest();
  if (manifest.length === 0) return [{ slug: "_" }];
  return manifest.map((e) => ({ slug: e.slug }));
}

export default async function ProgramGuidePage({ params }: Props) {
  const slug = params.slug;
  if (slug === "_") notFound();
  const [manifest, body] = await Promise.all([
    getProgramsManifest(),
    getArticleBody(slug),
  ]);
  const entry = getArticleBySlugFromManifest(manifest, slug);
  if (!entry) notFound();

  const rawBase = "/raw/programs";
  const programLinks = (entry.programPaths ?? []).length
    ? (entry.programPaths ?? []).map((p) => ({
        path: p,
        href: `/programs/${p.split("/").map(encodeURIComponent).join("/")}`,
        raw: `${rawBase}/${p}`,
        wget: `wget ${siteUrl}${rawBase}/${p}`,
      }))
    : [];
  const relatedRaw = getRelatedProgramLinks(entry, manifest);
  const relatedLinks = relatedRaw.map((r) => ({
    path: r.path,
    href: `/programs/${r.path.split("/").map(encodeURIComponent).join("/")}`,
    raw: `${rawBase}/${r.path}`,
    wget: `wget ${siteUrl}${rawBase}/${r.path}`,
    sourceLabel: r.sourceLabel,
    slug: r.slug,
    title: r.title,
  }));
  const hasDirectPaths = programLinks.length > 0;
  const primaryLinks = hasDirectPaths ? programLinks : relatedLinks;
  const browseProgramsHref = primaryLinks[0]?.href ?? "/programs";

  const relatedGuidesDeduped = entry.youtubeVideoId
    ? manifest.filter(
        (e) =>
          e.slug !== entry.slug && e.youtubeVideoId === entry.youtubeVideoId
      )
    : [];
  const suggestedGuides = getSuggestedGuides(entry, manifest);

  return (
    <article className="space-y-8 max-w-3xl">
      <nav className="flex items-center gap-1 text-sm font-mono overflow-x-auto pb-1">
        <Link href="/programs" className="text-[var(--turtle-lime)] hover:underline">
          Programs
        </Link>
        <span className="text-[var(--muted)]">/</span>
        <span className="text-[var(--text)]">{entry.title || entry.slug}</span>
      </nav>

      <header>
        <h1 className="text-3xl font-bold text-[var(--turtle-lime)]">
          {entry.title || entry.slug}
        </h1>
        <p className="text-[var(--muted)] mt-2">
          {entry.author && <span>Credit: {entry.author}</span>}
          {entry.videoPublishedAt && (
            <span className="ml-2">
              {new Date(entry.videoPublishedAt).toLocaleDateString()}
            </span>
          )}
        </p>
        <p className="text-xs text-[var(--muted)] mt-2">
          Files here are forked copies; our versions may have issues or be work-in-progress / bugfixes. Original authors are credited above.
        </p>
      </header>

      {/* Main hero image (AI-generated); if missing, video embed is the first visual */}
      {entry.imageMainPath && (
        <section className="rounded-[var(--radius)] overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
          <ImageLightbox
            src={(siteBasePath || "") + entry.imageMainPath}
            alt=""
            wrapperClassName="block w-full aspect-video"
            className="w-full h-full"
          />
        </section>
      )}

      {entry.youtubeVideoId && (
        <section className="rounded-[var(--radius)] overflow-hidden border border-[var(--border)] bg-black">
          <iframe
            title={entry.videoTitle || entry.title || "Video"}
            src={`https://www.youtube.com/embed/${entry.youtubeVideoId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full aspect-video"
          />
        </section>
      )}

      {/* Prominent: get the program + copy commands + file browser link */}
      <section className="rounded-[var(--radius)] border-2 border-[var(--turtle-green)] bg-[var(--surface)] p-4 sm:p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--turtle-lime)] mb-3">
          Get the program
        </h2>
        <div className="space-y-4">
          <p className="text-sm text-[var(--text)]">
            <Link
              href={browseProgramsHref}
              className="font-semibold text-[var(--turtle-lime)] underline hover:no-underline"
            >
              Open in file browser →
            </Link>
            {" "}
            {primaryLinks.length > 0 ? (
              hasDirectPaths ? (
                <>View and download from the full path.</>
              ) : (
                <>Program files from this episode — copy commands below.</>
              )
            ) : (
              <>Browse programs to find the file, then use wget below.</>
            )}
          </p>
          {primaryLinks.length > 0 ? (
            <div className="space-y-4">
              {primaryLinks.map((link) => (
                <div key={link.path} className="space-y-2">
                  {!("sourceLabel" in link) ? null : link.sourceLabel ? (
                    <p className="text-xs text-[var(--muted)]">
                      {link.sourceLabel}
                      {"slug" in link && link.slug && (
                        <>
                          {" · "}
                          <Link
                            href={`/programs/guides/${link.slug}`}
                            className="text-[var(--turtle-lime)] hover:underline"
                          >
                            {"title" in link ? link.title : link.slug}
                          </Link>
                        </>
                      )}
                    </p>
                  ) : null}
                  <p className="text-xs font-semibold uppercase text-[var(--muted)] font-mono break-all">
                    {link.path}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={link.href}
                      className="text-xs font-mono px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--surface)] text-[var(--turtle-lime)] hover:border-[var(--turtle-green)]"
                    >
                      View file page
                    </Link>
                  </div>
                  <CopyCommand command={link.wget} />
                </div>
              ))}
              {hasDirectPaths && relatedLinks.length > 0 && (
                <>
                  <p className="text-sm font-semibold text-[var(--muted)] pt-2 border-t border-[var(--border)]">
                    Same episode (other programs from this video)
                  </p>
                  {relatedLinks.map((link) => (
                    <div key={link.path} className="space-y-2">
                      <p className="text-xs text-[var(--muted)]">
                        {link.sourceLabel}
                        {" · "}
                        <Link
                          href={`/programs/guides/${link.slug}`}
                          className="text-[var(--turtle-lime)] hover:underline"
                        >
                          {link.title}
                        </Link>
                      </p>
                      <p className="text-xs font-semibold uppercase text-[var(--muted)] font-mono break-all">
                        {link.path}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={link.href}
                          className="text-xs font-mono px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--surface)] text-[var(--turtle-lime)] hover:border-[var(--turtle-green)]"
                        >
                          View file page
                        </Link>
                      </div>
                      <CopyCommand command={link.wget} />
                    </div>
                  ))}
                </>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs text-[var(--muted)]">
                Replace <code className="text-[var(--text)]">&lt;path&gt;</code> with the file path from the browser.
              </p>
              <CopyCommand command={`wget ${siteUrl}${rawBase}/<path>`} />
            </>
          )}
        </div>
      </section>

      {/* Up to 3 AI-generated illustrations */}
      {entry.imageIllustrations && entry.imageIllustrations.length > 0 && (
        <section className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
            Illustrations
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entry.imageIllustrations.map((ill, idx) => (
              <ImageLightbox
                key={idx}
                src={(siteBasePath || "") + ill.path}
                alt={ill.caption || ""}
                caption={ill.caption}
                className="w-full rounded border border-[var(--border)] aspect-[4/3]"
              />
            ))}
          </div>
        </section>
      )}

      {entry.videoDescription && (
        <section className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
            Video description
          </h2>
          <div className="text-sm text-[var(--text)] whitespace-pre-wrap font-sans">
            {entry.videoDescription}
          </div>
        </section>
      )}

      {body && <ArticleBody content={body} />}

      {!body && (entry.summary || entry.metaDescription) && (
        <p className="text-[var(--muted)]">
          {entry.summary || entry.metaDescription}
        </p>
      )}

      {primaryLinks.length > 0 && (
        <section className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
            Program files (links)
          </h2>
          <ul className="space-y-2 text-sm font-mono">
            {primaryLinks.map(({ path, href, raw }) => (
              <li key={path}>
                <Link href={href} className="text-[var(--turtle-lime)] hover:underline">
                  {path}
                </Link>
                {" · "}
                <a
                  href={siteUrl + raw}
                  className="text-[var(--muted)] hover:text-[var(--turtle-lime)]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  raw
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {relatedGuidesDeduped.length > 0 && (
        <section className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
            Related guides
          </h2>
          <p className="text-xs text-[var(--muted)] mb-2">
            Other guides from this episode.
          </p>
          <ul className="space-y-2 text-sm">
            {relatedGuidesDeduped.map((e) => (
              <li key={e.slug}>
                <Link
                  href={`/programs/guides/${e.slug}`}
                  className="text-[var(--turtle-lime)] hover:underline"
                >
                  {e.title || e.slug}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {suggestedGuides.length > 0 && (
        <section className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
          <details className="group" open>
            <summary className="list-none cursor-pointer py-2 px-2 rounded hover:bg-[var(--surface-hover)] text-sm text-[var(--muted)] hover:text-[var(--text)] flex items-center gap-2">
              <span className="font-semibold uppercase tracking-wider">
                Suggest others
              </span>
              <span className="text-xs">
                {suggestedGuides.length} more by {entry.author}
              </span>
              <span className="inline-block transition-transform group-open:rotate-180 text-[var(--muted)]">▼</span>
            </summary>
            <div className="grid gap-3 sm:grid-cols-2 mt-4 pt-4 border-t border-[var(--border)]">
              {suggestedGuides.map((e) => {
                const thumb = e.imageMainPath
                  ? (siteBasePath || "") + e.imageMainPath
                  : e.videoThumbnailUrl;
                return (
                  <Link
                    key={e.slug}
                    href={`/programs/guides/${e.slug}`}
                    className="flex gap-3 p-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--turtle-green)] hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    {thumb ? (
                      <img
                        src={thumb}
                        alt=""
                        className="w-20 h-14 sm:w-24 sm:h-16 object-cover rounded shrink-0 bg-[var(--border)]"
                      />
                    ) : (
                      <div className="w-20 h-14 sm:w-24 sm:h-16 rounded shrink-0 bg-[var(--border)] flex items-center justify-center text-[var(--muted)] text-xl">
                        ▶
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-[var(--turtle-lime)] text-sm line-clamp-2">
                        {e.title || e.slug}
                      </h3>
                      <p className="text-xs text-[var(--muted)] mt-0.5 line-clamp-2">
                        {e.summary ||
                          e.metaDescription ||
                          (e.videoDescription?.slice(0, 100) ?? "") ||
                          e.author}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </details>
        </section>
      )}

      <p className="text-sm text-[var(--muted)]">
        <Link href="/programs" className="text-[var(--turtle-lime)] hover:underline">
          ← Back to Programs
        </Link>
      </p>
    </article>
  );
}
