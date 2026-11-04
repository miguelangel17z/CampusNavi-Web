"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark, Wordmark } from "./Logo";

export const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/manual-usuario", label: "Manual de usuario" },
  { href: "/manual-administrador", label: "Manual de administrador" },
] as const;

const normalize = (path: string) => (path.length > 1 ? path.replace(/\/+$/, "") : path);

export function SiteHeader() {
  const pathname = normalize(usePathname() ?? "/");

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-night/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-3">
        <Link href="/" className="flex min-h-12 items-center gap-2" aria-label="Campus Navi, inicio">
          <LogoMark />
          <Wordmark />
        </Link>
        <nav aria-label="Principal">
          <ul className="flex flex-wrap gap-1 text-sm font-medium sm:text-base">
            {NAV_LINKS.map((link) => {
              const active = normalize(link.href) === pathname;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-12 items-center rounded-xl px-3 transition-colors ${
                      active ? "bg-surface-2 text-white ring-1 ring-violet" : "text-muted hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
