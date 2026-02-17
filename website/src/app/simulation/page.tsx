export default function SimulationPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--turtle-lime)] mb-2">Simulation</h1>
        <p className="text-[var(--muted)]">
          In-browser idea of how a turtle moves and mines — part of turtles.tips.
        </p>
      </div>

      <section className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-8 sm:p-12 text-center text-[var(--muted)]">
        <p className="mb-2">🐢</p>
        <p>Simulation coming soon.</p>
      </section>
    </div>
  );
}
