"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="group relative my-4 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
      {lang && <div className="border-b border-zinc-800 px-4 py-1.5 text-[11px] uppercase tracking-wide text-zinc-600">{lang}</div>}
      <button
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-400 opacity-0 transition group-hover:opacity-100 hover:text-zinc-200"
        title="Copy"
      >
        {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
      </button>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-zinc-300"><code>{code}</code></pre>
    </div>
  );
}
