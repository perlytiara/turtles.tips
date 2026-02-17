export default function DocsPage() {
  const links = [
    { name: "CC:Tweaked (mod)", url: "https://tweaked.cc/", desc: "Official CC:Tweaked documentation" },
    { name: "CraftOS-PC", url: "https://www.craftos-pc.cc/", desc: "Emulator and docs" },
    { name: "ComputerCraft Wiki", url: "https://www.computercraft.info/wiki/", desc: "Wiki and API reference" },
    { name: "TurtlesPAC docs", desc: "Credits and archive docs in TurtlesPAC/docs/ in the repo" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--turtle-lime)] mb-2">Docs</h1>
        <p className="text-[var(--muted)]">
          API, mod docs, CraftOS-PC, and setup guides for turtles, computers, and peripherals.
        </p>
      </div>

      <section className="space-y-3">
        {links.map((item) => (
          <div
            key={item.name}
            className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5"
          >
            {"url" in item && item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[var(--turtle-lime)] hover:underline"
              >
                {item.name}
              </a>
            ) : (
              <span className="font-semibold">{item.name}</span>
            )}
            {item.desc && <p className="text-sm text-[var(--muted)] mt-1">{item.desc}</p>}
          </div>
        ))}
      </section>
    </div>
  );
}
