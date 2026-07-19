// Docs navigation. Engine-agnostic throughout — capabilities, never engines.
export interface DocLink {
  slug: string; // "" = /docs index
  title: string;
}
export interface DocSection {
  title: string;
  links: DocLink[];
}

export const DOCS_NAV: DocSection[] = [
  {
    title: "Getting started",
    links: [
      { slug: "", title: "Introduction" },
      { slug: "quickstart", title: "Quickstart" },
    ],
  },
  {
    title: "Services",
    links: [
      { slug: "database", title: "Database" },
      { slug: "storage", title: "Storage" },
      { slug: "realtime", title: "Realtime Database" },
      { slug: "auth", title: "Authentication" },
      { slug: "functions", title: "Functions" },
    ],
  },
  {
    title: "Reference",
    links: [{ slug: "api", title: "API reference" }],
  },
];

export function docHref(slug: string): string {
  return slug ? `/docs/${slug}` : "/docs";
}
