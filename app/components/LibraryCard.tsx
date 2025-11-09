import Image from "next/image";
import type { Library } from "@/lib/types";

export default function LibraryCard({ lib }: { lib: Library }) {
  const rawTags = lib.tags
  const tags = rawTags.toSorted();

  return (
    <a href={lib.website_url} target="_blank" rel="noreferrer" className="group flex flex-col gap-3 rounded-xl border dark:border-white/10 border-black/10 dark:bg-black/30 p-4 transition-colors dark:hover:border-white/15 dark:hover:bg-white/7 hover:bg-gray-100/50">
      <div className="flex items-start gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-white/5">
          <Image
            loading="eager"
            src={lib.logo_url || "/next.svg"}
            alt={lib.name}
            width={30}
            height={30}
            unoptimized
            className="dark:invert-0"
          />
        </div>

        <div className="flex flex-col">
          <span className="text-xl font-medium text-neutral-900 dark:text-white antialiased font-sans">{lib.name}</span>
          <span className="text-sm text-zinc-400 leading-none font-sans dark:text-zinc-400 font-light pt-1">{lib.framework || "Tools"}</span>
        </div>
      </div>

      <p className="line-clamp text-sm text-neutral-600 dark:text-zinc-300 flex-1 py-6 font-sans font-light">{lib.description}</p>
      
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <span
            key={t}
            className="rounded-full border-0 border-neutral-100/70 dark:border-white/10 bg-black/5 dark:bg-white/10 px-3 py-1 text-xs text-zinc-600 dark:text-zinc-300 font-sans font-light"
          >
            {t}
          </span>
        ))}
      </div>
    </a>
  );
}