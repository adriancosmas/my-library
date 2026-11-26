import Image from "next/image";
import Link from "next/link";
import { getAllLibraries } from "@/lib/libraries";

const TILES = 12;

// Rotates daily through tools that have a logo, so the wall is real and changes without editing anything.
function pickTiles<T>(items: T[], n: number): T[] {
  if (items.length <= n) return items;
  const start = (Math.floor(Date.now() / 86_400_000) * n) % items.length;
  return Array.from({ length: n }, (_, i) => items[(start + i) % items.length]);
}

export async function Hero() {
  const all = await getAllLibraries();
  const tiles = pickTiles(all.filter((l) => l.logo_url), TILES);

  return (
    <section className="mb-14 grid grid-cols-1 items-center gap-10 pt-4 sm:pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-14">
      <div className="min-w-0">
        <h1 className="hero-rise max-w-[24ch] break-words text-balance text-3xl sm:text-5xl font-semibold leading-[1.05] tracking-tight text-foreground">
          Just tons of resources to help your daily life and productivity
        </h1>
        <p className="hero-rise mt-6 text-sm text-muted-foreground sm:text-base" style={{ animationDelay: "100ms" }}>
          Curated by{" "}
          <a
            href="https://cosmas.is-a.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline decoration-primary decoration-2 underline-offset-4"
          >
            Cosmas
          </a>
        </p>
      </div>

      {tiles.length > 0 && (
        <ul className="grid grid-cols-4 gap-3">
          {tiles.map((lib, i) => (
            <li
              key={lib.id}
              className={`hero-rise ${i % 2 === 1 ? "translate-y-4" : ""}`}
              style={{ animationDelay: `${150 + i * 40}ms` }}
            >
              <Link
                href={`/tools/${lib.slug}`}
                title={lib.name}
                className="group grid aspect-square place-items-center rounded-lg bg-white/10 outline-none transition-transform duration-200 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Image src={lib.logo_url!} alt={lib.name} width={36} height={36} unoptimized className="size-9 object-contain" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
