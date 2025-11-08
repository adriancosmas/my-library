import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient, getSupabaseClient } from "@/lib/supabaseClient";
import Header from "@/app/components/Header";

async function createLibrary(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const framework = String(formData.get("framework") || "React").trim();
  const website_url = String(formData.get("website_url") || "").trim();
  const logo_url = String(formData.get("logo_url") || "").trim();
  const tagsInput = String(formData.get("tags") || "").trim();

  const tags = tagsInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const serverClient = getSupabaseServerClient();
  const client = serverClient || getSupabaseClient();

  if (!client) {
    // Gracefully redirect with an error param instead of throwing
    redirect("/submit?error=supabase_not_configured");
  }

  const { data: lib, error: libError } = await client
    .from("libraries")
    .insert({ name, slug, description, framework, website_url, logo_url })
    .select("id")
    .single();

  if (libError) {
    redirect(`/submit?error=${encodeURIComponent(libError.message)}`);
  }

  for (const tagName of tags) {
    const { data: tagRow, error: tagError } = await client
      .from("tags")
      .upsert({ name: tagName }, { onConflict: "name" })
      .select("id")
      .single();
    if (tagError) {
      redirect(`/submit?error=${encodeURIComponent(tagError.message)}`);
    }

    await client
      .from("library_tags")
      .upsert(
        { library_id: lib.id, tag_id: tagRow.id },
        { onConflict: "library_id,tag_id" }
      );
  }

  revalidatePath("/");
  redirect("/?submitted=1");
}

export default async function SubmitPage({
  searchParams,
}: {
  // Next.js 16: searchParams is now a Promise
  searchParams?: Promise<{ error?: string }>;
}) {
  const isConfigured = !!(getSupabaseServerClient() || getSupabaseClient());
  const params = await searchParams;
  const error = params?.error;
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-2 text-2xl font-semibold dark:text-white text-neutral-900">Submit Library</h1>

        {!isConfigured && (
          <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            Supabase is not configured. Set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and optionally `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.
          </div>
        )}

      {error === "supabase_not_configured" && (
        <div className="mb-4 rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-300">
          Submission failed because Supabase is not configured.
        </div>
      )}

      {error && error !== "supabase_not_configured" && (
        <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <p className="mb-6 text-sm text-zinc-400">
        Add a UI library. Tags are comma separated. Framework examples: React, Vue, Svelte.
      </p>

      <form action={createLibrary} className="space-y-4">
        <div className="grid gap-2">
          <label className="text-sm">Name</label>
          <input name="name" required className="rounded-md border border-black/10 dark:border-white/10 dark:bg-black/60 bg-white px-3 py-2" />
        </div>

        <div className="grid gap-2">
          <label className="text-sm">Slug</label>
          <input name="slug" required className="rounded-md border border-black/10 dark:border-white/10 dark:bg-black/60 bg-white px-3 py-2" />
        </div>

        <div className="grid gap-2">
          <label className="text-sm">Description</label>
          <textarea name="description" rows={3} className="rounded-md border border-black/10 dark:border-white/10 dark:bg-black/60 bg-white px-3 py-2" />
        </div>

        <div className="grid gap-2">
          <label className="text-sm">Framework</label>
          <input name="framework" className="rounded-md border border-black/10 dark:border-white/10 dark:bg-black/60 bg-white px-3 py-2" />
        </div>

        <div className="grid gap-2">
          <label className="text-sm">Website URL</label>
          <input name="website_url" className="rounded-md border border-black/10 dark:border-white/10 dark:bg-black/60 bg-white px-3 py-2" />
        </div>

        <div className="grid gap-2">
          <label className="text-sm">Logo URL</label>
          <input
            name="logo_url"
            placeholder="https://.../logo.png"
            className="rounded-md border border-black/10 dark:border-white/10 dark:bg-black/60 bg-white px-3 py-2"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm">Tags (comma separated)</label>
          <input name="tags" placeholder="components, tailwind, react" className="rounded-md border border-black/10 dark:border-white/10 dark:bg-black/60 bg-white px-3 py-2" />
        </div>

        <button
          type="submit"
          disabled={!isConfigured}
          className="rounded-md dark:bg-yellow-200 bg-yellow-400 px-8 py-2 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer text-neutral-900 font-semibold mt-4 text-base"
          title={!isConfigured ? "Configure Supabase in .env.local to enable submissions" : undefined}
        >
          Submit
        </button>
      </form>
      </div>
    </div>
  );
}