import type { ReactNode } from "react";

export function H1({ children }: { children: ReactNode }) {
  return <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">{children}</h1>;
}
export function Lead({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-lg text-zinc-400">{children}</p>;
}
export function H2({ children }: { children: ReactNode }) {
  return <h2 className="mt-10 border-b border-zinc-800 pb-2 text-xl font-semibold text-zinc-100">{children}</h2>;
}
export function P({ children }: { children: ReactNode }) {
  return <p className="mt-4 leading-relaxed text-zinc-300">{children}</p>;
}
export function Ul({ children }: { children: ReactNode }) {
  return <ul className="mt-4 list-disc space-y-1.5 pl-5 text-zinc-300 marker:text-zinc-600">{children}</ul>;
}
export function IC({ children }: { children: ReactNode }) {
  return <code className="rounded bg-zinc-800/80 px-1.5 py-0.5 font-mono text-[0.85em] text-amber-300">{children}</code>;
}
