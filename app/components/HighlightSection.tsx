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
            <h2 className="text-[22px] font-semibold leading-7 tracking-tight text-foreground">
              {hl.title}
            </h2>
            {hl.description ? (
              <p className="mt-1 text-sm text-muted-foreground">
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
                  className="group flex flex-col overflow-hidden rounded-md bg-card transition-colors hover:bg-secondary"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-secondary">
                    <Image
                      src={imgSrc}
                      alt={lib.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex items-center gap-3 p-4">
                    {lib.logo_url ? (
                      <div className="grid size-10 shrink-0 place-items-center rounded-sm bg-white">
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
                      <span className="text-sm font-medium text-foreground">
                        {lib.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
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
