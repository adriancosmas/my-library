import type { Highlight } from "@/lib/types";
import Image from "next/image";

export default function HighlightSection({ highlights }: { highlights: Highlight[] }) {
  if (highlights.length === 0) return null;

  // console.log(highlights);

  return (
    <section className="mb-16 space-y-10">
      {highlights.map((hl) => (
        <div key={hl.id}>
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white font-sans tracking-tight">
              {hl.title}
            </h3>
            {hl.description ? (
              <p className="mt-1 text-sm text-zinc-400 font-sans font-light">
                {hl.description}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hl.items.map((item) => {
              if (!item.library) return null;
              const lib = item.library;
              const imgSrc = lib.og_image_url || lib.favicon_url || "/next.svg";
              const externalUrl = lib.website_url?.includes("?")
                ? `${lib.website_url}&ref=cosudirectory`
                : `${lib.website_url || "#"}?ref=cosudirectory`;

              return (
                <a
                  key={item.id}
                  href={externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col overflow-hidden rounded-md border dark:border-white/10 border-black/10 dark:bg-black/30 bg-white transition-colors dark:hover:border-white/15 dark:hover:bg-white/7 hover:bg-gray-100/50"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-black/5 dark:bg-white/5">
                    <Image
                      src={imgSrc}
                      alt={lib.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      unoptimized
                    />
                  </div>
                  <div className="flex items-center gap-3 p-4">
                    {lib.logo_url ? (
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-white/5">
                        <Image
                          src={lib.logo_url}
                          alt=""
                          width={28}
                          height={28}
                          unoptimized
                        />
                      </div>
                    ) : null}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-neutral-900 dark:text-white font-sans">
                        {lib.name}
                      </span>
                      <span className="text-xs text-zinc-400 font-sans font-light">
                        {lib.category || "Tools"}
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
