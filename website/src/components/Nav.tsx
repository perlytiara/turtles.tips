import Link from "next/link";
import { Logo } from "@/components/Logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/programs", label: "Programs" },
  { href: "/community", label: "Community" },
  { href: "/docs", label: "Docs" },
  { href: "/resources", label: "Resources" },
  { href: "/credits", label: "Credits" },
];

export function Nav() {
  return (
    <nav className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-sm">
      <div className="page-shell">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-[var(--turtle-lime)] hover:text-[var(--accent)] hover:no-underline"
            aria-label="turtles.tips home"
          >
            <Logo className="h-8 w-8 shrink-0" />
            turtles.tips
          </Link>
          <ul className="flex flex-wrap items-center justify-end gap-0.5 text-sm">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="rounded-lg px-3 py-2 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
