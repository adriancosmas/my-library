import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient, getSupabaseClient } from "@/lib/supabaseClient";

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
    <div className="mx-auto max-w-2xl px-6 py-10 text-zinc-200">
      <h1 className="mb-4 text-2xl font-semibold text-white">Submit Library</h1>
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
          <input name="name" required className="rounded-md border border-white/10 bg-black/60 px-3 py-2" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Slug</label>
          <input name="slug" required className="rounded-md border border-white/10 bg-black/60 px-3 py-2" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Description</label>
          <textarea name="description" rows={3} className="rounded-md border border-white/10 bg-black/60 px-3 py-2" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Framework</label>
          <input name="framework" defaultValue="React" className="rounded-md border border-white/10 bg-black/60 px-3 py-2" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Website URL</label>
          <input name="website_url" className="rounded-md border border-white/10 bg-black/60 px-3 py-2" />
        </div>
        {/* GitHub URL removed per request */}
        <div className="grid gap-2">
          <label className="text-sm">Logo URL</label>
          <input
            name="logo_url"
            placeholder="https://.../logo.png"
            className="rounded-md border border-white/10 bg-black/60 px-3 py-2"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Tags (comma separated)</label>
          <input name="tags" placeholder="components, tailwind, react" className="rounded-md border border-white/10 bg-black/60 px-3 py-2" />
        </div>
        <button
          type="submit"
          disabled={!isConfigured}
          className="rounded-md bg-white/10 px-4 py-2 text-sm hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          title={!isConfigured ? "Configure Supabase in .env.local to enable submissions" : undefined}
        >
          Submit
        </button>
      </form>
    </div>
  );
}