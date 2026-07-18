"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Modal from "@/components/ui/Modal";

const REGIONS = [
  { value: "us-east", label: "US East" },
  { value: "us-west", label: "US West" },
  { value: "eu-west", label: "EU West" },
  { value: "af-south", label: "Africa South" },
];

export default function CreateProjectDialog({
  action,
}: {
  action: (formData: FormData) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 items-center gap-2 rounded-lg bg-amber-500 px-3.5 text-sm font-medium text-black transition hover:bg-amber-400"
      >
        <Plus size={16} /> New project
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create a project"
        description="A project groups your database, storage and realtime."
      >
        <form action={action} className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Project name</label>
            <input
              name="name"
              autoFocus
              required
              placeholder="My awesome app"
              className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Region</label>
            <select
              name="region"
              defaultValue="us-east"
              className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-amber-500"
            >
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-9 rounded-lg border border-zinc-700 px-4 text-sm text-zinc-300 transition hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 rounded-lg bg-amber-500 px-4 text-sm font-medium text-black transition hover:bg-amber-400"
            >
              Create project
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
