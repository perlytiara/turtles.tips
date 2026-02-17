import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import Link from "next/link";

export const metadata: Metadata = {
  title: "turtles.tips — Turtles, computers, peripherals & network",
  description:
    "Tips, programs, and docs for CC:Tweaked: mining turtles, computers, peripherals, and network. Curated archive with full credit to authors.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <Nav />
        <main className="flex-1 w-full flex justify-center px-0">
          <div className="page-shell py-10 sm:py-12">
            {children}
          </div>
        </main>
        <footer className="border-t border-[var(--border)] bg-[var(--bg-subtle)]">
          <div className="page-shell py-8 text-center text-sm text-[var(--muted)]">
            <p className="mb-1">
              <strong className="text-[var(--turtle-lime)]">turtles.tips</strong>
              {" — turtles, computers, peripherals & network."}
            </p>
            <p>
              <Link href="/programs" className="hover:underline">Programs</Link>
              {" · "}
              <Link href="/community" className="hover:underline">Community</Link>
              {" · "}
              <Link href="/credits" className="hover:underline">Credits</Link>
              {" · "}
              Powered by{" "}
              <Link href="/community" className="text-[var(--turtle-lime)] hover:underline">
                TurtlesPAC
              </Link>
              {" · "}
              Credit to all original authors.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
