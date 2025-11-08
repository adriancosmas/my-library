"use client";
import React, { useEffect, useState } from "react";
import { slugify } from "@/lib/utils";

export default function NameSlugFields() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  // Auto-fill slug from name as the user types
  useEffect(() => {
    setSlug(slugify(name));
  }, [name]);

  return (
    <>
      <div className="grid gap-2">
        <label className="text-sm font-sans font-light">Name</label>
        <input
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border border-black/10 dark:border-white/10 dark:bg-black/60 bg-white px-3 py-2 font-sans"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-sans font-light">Slug</label>
        <input
          disabled
          name="slug"
          required
          value={slug}
          onChange={(e) => setSlug(slugify(e.target.value))}
          onBlur={(e) => setSlug(slugify(e.target.value))}
          placeholder=""
          className="rounded-md border border-black/10 dark:border-white/10 dark:bg-black/60 bg-white px-3 py-2 font-sans"
        />
      </div>
    </>
  );
}