import { resources } from "@/data/resources";

export default function ResourcesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--turtle-lime)] mb-2">Resources</h1>
        <p className="text-[var(--muted)]">
          Forums, Pastebin, Gists, and other links — turtles, computers, and network tips beyond GitHub.
        </p>
      </div>

      <section className="rounded-[var(--radius)] border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                <th className="p-3 font-semibold">Resource</th>
                <th className="p-3 font-semibold">URL</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr key={r.url} className="border-b border-[var(--border)] hover:bg-[var(--surface)]/50">
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-[var(--turtle-lime)] break-all">
                      {r.url}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
