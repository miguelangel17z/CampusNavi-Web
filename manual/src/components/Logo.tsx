/** Pin de ubicación con órbita, como el logo de la app. Decorativo. */
export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="pin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#5b3df5" />
        </linearGradient>
      </defs>
      <ellipse
        cx="32"
        cy="30"
        rx="28"
        ry="10"
        fill="none"
        stroke="#7c4dff"
        strokeWidth="4"
        transform="rotate(-18 32 30)"
      />
      <path d="M32 4c-10 0-18 8-18 18 0 13 18 34 18 34s18-21 18-34C50 12 42 4 32 4z" fill="url(#pin)" />
      <circle cx="32" cy="21" r="7" fill="#050816" />
      <circle cx="32" cy="21" r="3" fill="#a78bfa" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="text-xl font-bold tracking-tight">
      Campus <span className="text-lilac">Navi</span>
    </span>
  );
}
