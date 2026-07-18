"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRound, Plus, Copy, Check, Trash2, Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import { fetchKeys, createKey, revokeKey, type ApiKey } from "@/lib/api/apikeys-client";

export default function ApiKeysClient({ project }: { project: string }) {
  const confirm = useConfirm();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [created, setCreated] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setKeys(await fetchKeys(project));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [project]);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    setError(null);
    try {
      const { key } = await createKey(project, name);
      setShowCreate(false);
      setName("");
      setCreated(key);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const revoke = async (k: ApiKey) => {
    if (!(await confirm({ title: "Revoke key", message: `Revoke "${k.name}"? Apps using it will stop working immediately.`, danger: true, confirmLabel: "Revoke" }))) return;
    await revokeKey(project, k.id);
    await load();
  };

  const copy = () => {
    if (created) navigator.clipboard.writeText(created);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-medium text-zinc-100">API keys</h2>
          <p className="mt-1 text-sm text-zinc-400">Let external apps call your project’s API.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex h-9 items-center gap-2 rounded-lg bg-amber-500 px-3.5 text-sm font-medium text-black transition hover:bg-amber-400"
        >
          <Plus size={16} /> New key
        </button>
      </div>

      {error && <div className="mt-3 text-sm text-red-400">{error}</div>}

      <div className="mt-4">
        {loading ? (
          <div className="flex justify-center py-6 text-zinc-500"><Loader2 className="animate-spin" size={18} /></div>
        ) : keys.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-600">No API keys yet.</p>
        ) : (
          keys.map((k) => (
            <div key={k.id} className="flex items-center gap-3 border-t border-zinc-800/60 py-3 first:border-0">
              <KeyRound size={16} className="text-zinc-500" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-zinc-200">{k.name}</span>
                  {k.revoked && <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] text-red-400">Revoked</span>}
                </div>
                <div className="font-mono text-xs text-zinc-500">{k.prefix}••••••••</div>
              </div>
              <span className="text-xs text-zinc-600">
                {k.lastUsedAt ? `used ${new Date(k.lastUsedAt).toLocaleDateString()}` : "never used"}
              </span>
              {!k.revoked && (
                <button onClick={() => revoke(k)} className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500 hover:text-red-400" title="Revoke">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create dialog */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New API key">
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">Key name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            placeholder="e.g. Production server"
            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-amber-500"
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={() => setShowCreate(false)} className="h-9 rounded-lg border border-zinc-700 px-4 text-sm text-zinc-300 hover:bg-zinc-800">Cancel</button>
          <button onClick={submit} className="h-9 rounded-lg bg-amber-500 px-4 text-sm font-medium text-black hover:bg-amber-400">Create key</button>
        </div>
      </Modal>

      {/* Reveal-once dialog */}
      <Modal open={!!created} onClose={() => setCreated(null)} title="Copy your API key" description="This is the only time you’ll see it. Store it somewhere safe.">
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
          <code className="min-w-0 flex-1 truncate font-mono text-sm text-amber-300">{created}</code>
          <button onClick={copy} className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
          </button>
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={() => setCreated(null)} className="h-9 rounded-lg bg-amber-500 px-4 text-sm font-medium text-black hover:bg-amber-400">Done</button>
        </div>
      </Modal>
    </div>
  );
}
