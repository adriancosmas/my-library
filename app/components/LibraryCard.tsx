import Image from "next/image";
import type { Library } from "@/lib/types";

export default function LibraryCard({ lib }: { lib: Library }) {
  return (
    <a href={lib.website_url} target="_blank" rel="noreferrer" className="group relative flex flex-col gap-3 rounded-xl border border-white/10 dark:bg-black/30 p-4 transition-colors hover:border-white/20 hover:bg-white/7">
      <div className="flex items-center gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-white/5">
          <Image
            src={lib.logo_url || "/next.svg"}
            alt={lib.name}
            width={30}
            height={30}
            unoptimized
            className="dark:invert-0"
          />
        </div>

        <div className="flex flex-col">
          <span className="text-xl font-semibold text-white antialiased">{lib.name}</span>
          <span className="text-sm text-zinc-400">{lib.framework}</span>
        </div>
      </div>

      <p className="line-clamp-3 text-sm text-zinc-300 py-4">{lib.description}</p>
      
      <div className="flex flex-wrap gap-2">
        {lib.tags.map((t) => (
          <span
            key={t}
            className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-300"
          >
            {t}
          </span>
        ))}
      </div>
      
      {/* <div className="flex gap-2 pt-2 text-xs">
        {lib.website_url && (
          <a
            href={lib.website_url}
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-white/10 px-2 py-1 text-zinc-200 hover:bg-white/20"
          >
            Website
          </a>
        )}
      </div> */}
    </a>
  );
}