"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { createTable, TYPE_OPTIONS, type NewColumn } from "@/lib/api/sql-client";

export default function AddTableDialog({
  project,
  onCreated,
}: {
  project: string;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [columns, setColumns] = useState<NewColumn[]>([{ name: "", type: "text", nullable: true }]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setName("");
    setColumns([{ name: "", type: "text", nullable: true }]);
    setError(null);
  };

  const update = (i: number, patch: Partial<NewColumn>) =>
    setColumns((cs) => cs.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  const submit = async () => {
    setError(null);
    setSaving(true);
    try {
      const cols = columns.filter((c) => c.name.trim());
      await createTable(project, name.trim(), cols);
      setOpen(false);
      reset();
      onCreated();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 items-center gap-2 rounded-lg bg-amber-500 px-3.5 text-sm font-medium text-black transition hover:bg-amber-400"
      >
        <Plus size={16} /> New table
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="New table" maxWidth="max-w-lg">
            <p className="mt-1 text-sm text-zinc-400">
              An <code className="text-zinc-300">id</code> and{" "}
              <code className="text-zinc-300">created_at</code> column are added automatically.
            </p>

            <div className="mt-5">
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Table name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                placeholder="e.g. customers"
                className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-amber-500"
              />
            </div>

            <div className="mt-5">
              <div className="mb-2 text-xs font-medium text-zinc-400">Columns</div>
              <div className="space-y-2">
                {columns.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={c.name}
                      onChange={(e) => update(i, { name: e.target.value })}
                      placeholder="column_name"
                      className="h-9 flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-amber-500"
                    />
                    <select
                      value={c.type}
                      onChange={(e) => update(i, { type: e.target.value as NewColumn["type"] })}
                      className="h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-2 text-sm text-zinc-100 outline-none focus:border-amber-500"
                    >
                      {TYPE_OPTIONS.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-1 text-xs text-zinc-400" title="Required">
                      <input
                        type="checkbox"
                        checked={!c.nullable}
                        onChange={(e) => update(i, { nullable: !e.target.checked })}
                      />
                      Req
                    </label>
                    <button
                      onClick={() => setColumns((cs) => cs.filter((_, idx) => idx !== i))}
                      className="text-zinc-600 hover:text-red-400"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setColumns((cs) => [...cs, { name: "", type: "text", nullable: true }])}
                className="mt-2 flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300"
              >
                <Plus size={14} /> Add column
              </button>
            </div>

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="h-9 rounded-lg border border-zinc-700 px-4 text-sm text-zinc-300 transition hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={saving || !name.trim()}
                className="h-9 rounded-lg bg-amber-500 px-4 text-sm font-medium text-black transition hover:bg-amber-400 disabled:opacity-50"
              >
                {saving ? "Creating…" : "Create table"}
              </button>
            </div>
      </Modal>
    </>
  );
}
