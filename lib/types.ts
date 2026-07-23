export type Library = {
  id: string;
  name: string;
  slug: string;
  description: string;
  framework: string; // e.g., React, Vue, Svelte
  website_url?: string;
  github_url?: string;
  stars?: number;
  logo_url?: string;
  og_image_url?: string;
  favicon_url?: string;
  tags: string[];
};

export type LibraryFilters = {
  q?: string;
  framework?: string;
  tag?: string;
  page?: string;
  saved?: string;
};

export type HighlightItem = {
  id: string;
  highlight_id: string;
  library_id: string;
  library: {
    id: string;
    name: string;
    slug: string;
    framework: string | null;
    logo_url: string | null;
    og_image_url: string | null;
    favicon_url: string | null;
    website_url: string | null;
  } | null;
};

export type Highlight = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  items: HighlightItem[];
};