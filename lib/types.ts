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
  tags: string[];
};

export type LibraryFilters = {
  q?: string;
  framework?: string;
  tag?: string;
  page?: string;
};