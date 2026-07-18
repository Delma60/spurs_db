"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({
  open,
  onClose,
  title,
  description,
  maxWidth = "max-w-md",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  maxWidth?: string;
  children?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl`}>
        <button onClick={onClose} className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-300">
          <X size={18} />
        </button>
        {title && <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>}
        {description && <p className="mt-1 text-sm text-zinc-400">{description}</p>}
        {children}
      </div>
    </div>
  );
}
