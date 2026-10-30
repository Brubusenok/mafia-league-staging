import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Mafia League — на главную">
      <span
        aria-hidden
        className="flex size-10 items-center justify-center rounded-control bg-accent font-display text-xl font-bold text-text"
      >
        M
      </span>
      <span className="leading-tight">
        <span className="block font-display text-lg tracking-[0.12em] sm:text-xl">
          MAFIA LEAGUE
        </span>
        <span className="block text-[11px] tracking-[0.3em] text-muted uppercase">
          Graz · Austria
        </span>
      </span>
    </Link>
  );
}
