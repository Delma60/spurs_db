"use client";

import { useCallback, useEffect, useState } from "react";
import { FunctionSquare, Plus, Play, Save, Trash2, Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import {
  fetchFunctions, getFunction, createFunction, updateFunction, deleteFunction, runFunction,
  type FnSummary, type Fn, type RunResult,
} from "@/lib/api/functions-client";

export default function FunctionsClient({ project }: { project: string }) {
  const confirm = useConfirm();
  const [fns, setFns] = useState<FnSummary[]>([]);
  const [selected, setSelected] = useState<Fn | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [input, setInput] = useState("{}");
  const [output, setOutput] = useState<RunResult | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchFunctions(project);
      setFns(list);
      if (list[0]) await open(list[0].id);
      else setSelected(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [project]);

  const open = async (id: string) => {
    const fn = await getFunction(project, id);
    setSelected(fn);
    setCode(fn.code);
    setOutput(null);
  };

  useEffect(() => { load(); }, [load]);

  const submitNew = async () => {
    setError(null);
    try {
      const fn = await createFunction(project, name);
      setShowCreate(false);
      setName("");
      await fetchFunctions(project).then(setFns);
      await open(fn.id);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await updateFunction(project, selected.id, code);
    } finally {
      setSaving(false);
    }
  };

  const test = async () => {
    if (!selected) return;
    await save();
    let parsed: unknown = {};
    try { parsed = JSON.parse(input || "{}"); } catch { setOutput({ logs: [], error: "Input is not valid JSON" }); return; }
    setOutput(await runFunction(project, selected.id, parsed));
  };

  const remove = async () => {
    if (!selected || !(await confirm({ title: "Delete function", message: `Delete "${selected.name}"?`, danger: true, confirmLabel: "Delete" }))) return;
    await deleteFunction(project, selected.id);
    setSelected(null);
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Functions</h1>
          <p className="mt-1 text-sm text-zinc-500">Run backend logic on demand</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex h-9 items-center gap-2 rounded-lg bg-amber-500 px-3.5 text-sm font-medium text-black transition hover:bg-amber-400">
          <Plus size={16} /> New function
        </button>
      </div>

      {error && <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{error}</div>}

      {loading ? (
        <div className="mt-16 flex justify-center text-zinc-500"><Loader2 className="animate-spin" /></div>
      ) : fns.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-zinc-800 py-20 text-center">
          <FunctionSquare className="mx-auto text-zinc-600" size={30} />
          <p className="mt-3 text-zinc-300">No functions yet.</p>
          <p className="mt-1 text-sm text-zinc-600">Create one to run backend code on demand.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-[180px_1fr] gap-6">
          <div className="space-y-1">
            {fns.map((f) => (
              <button key={f.id} onClick={() => open(f.id)} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${selected?.id === f.id ? "bg-zinc-800 font-medium text-zinc-100" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"}`}>
                <FunctionSquare size={15} />
                <span className="truncate">{f.name}</span>
              </button>
            ))}
          </div>

          {selected && (
            <div className="min-w-0">
              <div className="flex items-center justify-between">
                <div className="font-mono text-sm text-zinc-300">
                  POST <span className="text-amber-400">/api/v1/functions/{selected.name}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={save} disabled={saving} className="flex h-8 items-center gap-1.5 rounded-lg border border-zinc-700 px-3 text-sm text-zinc-200 hover:bg-zinc-800 disabled:opacity-50">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                  </button>
                  <button onClick={test} className="flex h-8 items-center gap-1.5 rounded-lg bg-amber-500 px-3 text-sm font-medium text-black hover:bg-amber-400">
                    <Play size={14} /> Test
                  </button>
                  <button onClick={remove} className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-800 text-zinc-500 hover:border-red-500/40 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>

              <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} rows={12}
                className="mt-3 w-full resize-y rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-sm text-zinc-100 outline-none focus:border-amber-500" />

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="mb-1.5 text-xs font-medium text-zinc-400">Test input (JSON)</div>
                  <textarea value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} rows={5}
                    className="w-full resize-y rounded-xl border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs text-zinc-100 outline-none focus:border-amber-500" />
                </div>
                <div>
                  <div className="mb-1.5 text-xs font-medium text-zinc-400">Result</div>
                  <div className="min-h-[7rem] rounded-xl border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs">
                    {!output ? <span className="text-zinc-600">Run to see output.</span> : output.error ? (
                      <span className="text-red-400">{output.error}</span>
                    ) : (
                      <>
                        <pre className="whitespace-pre-wrap text-emerald-300">{JSON.stringify(output.result, null, 2)}</pre>
                        {output.logs.length > 0 && <pre className="mt-2 whitespace-pre-wrap text-zinc-500">{output.logs.join("\n")}</pre>}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New function">
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">Function name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder="e.g. hello"
            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-amber-500" />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={() => setShowCreate(false)} className="h-9 rounded-lg border border-zinc-700 px-4 text-sm text-zinc-300 hover:bg-zinc-800">Cancel</button>
          <button onClick={submitNew} disabled={!name.trim()} className="h-9 rounded-lg bg-amber-500 px-4 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50">Create</button>
        </div>
      </Modal>
    </div>
  );
}
