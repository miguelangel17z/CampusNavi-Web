import { Wordmark } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <Wordmark />
        <p>Accesibilidad y orientación para todos. Proyecto 4U · Universidad EAFIT.</p>
      </div>
    </footer>
  );
}
