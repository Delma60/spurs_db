"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  HardDrive, FolderPlus, Upload, Trash2, Download, File as FileIcon,
  Loader2, X, Globe, Lock,
} from "lucide-react";
import {
  fetchBuckets, createBucket, deleteBucket, fetchObjects,
  uploadFile, deleteObject, downloadUrl, type Bucket, type StoredObject,
} from "@/lib/api/storage-client";
import Modal from "@/components/ui/Modal";
import { useConfirm } from "@/components/ui/ConfirmProvider";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export default function StorageBrowser({ project }: { project: string }) {
  const confirm = useConfirm();
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [objects, setObjects] = useState<StoredObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPublic, setNewPublic] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const loadBuckets = useCallback(async () => {
    setLoading(true);
    try {
      const b = await fetchBuckets(project);
      setBuckets(b);
      setSelected((cur) => cur ?? b[0]?.id ?? null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [project]);

  const loadObjects = useCallback(async (bucketId: string) => {
    setError(null);
    try {
      setObjects(await fetchObjects(project, bucketId));
    } catch (e) {
      setError((e as Error).message);
    }
  }, [project]);

  useEffect(() => { loadBuckets(); }, [loadBuckets]);
  useEffect(() => { if (selected) loadObjects(selected); }, [selected, loadObjects]);

  const submitBucket = async () => {
    setError(null);
    try {
      await createBucket(project, newName, newPublic);
      setShowCreate(false);
      setNewName("");
      setNewPublic(false);
      await loadBuckets();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const onUpload = async (files: FileList | null) => {
    if (!selected || !files?.length) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) await uploadFile(project, selected, file);
      await loadObjects(selected);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const onDownload = async (name: string) => {
    if (!selected) return;
    const url = await downloadUrl(project, selected, name);
    window.open(url, "_blank");
  };

  const onDeleteObject = async (name: string) => {
    if (!selected || !(await confirm({ title: "Delete file", message: `Delete "${name}"? This can’t be undone.`, danger: true, confirmLabel: "Delete" }))) return;
    await deleteObject(project, selected, name);
    await loadObjects(selected);
  };

  const onDeleteBucket = async (bucket: Bucket) => {
    if (!(await confirm({ title: "Delete bucket", message: `Delete bucket "${bucket.name}" and all its files? This can’t be undone.`, danger: true, confirmLabel: "Delete bucket" }))) return;
    await deleteBucket(project, bucket.id);
    setSelected(null);
    setObjects([]);
    await loadBuckets();
  };

  const current = buckets.find((b) => b.id === selected);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Storage</h1>
          <p className="mt-1 text-sm text-zinc-500">Buckets for files and media</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex h-9 items-center gap-2 rounded-lg bg-amber-500 px-3.5 text-sm font-medium text-black transition hover:bg-amber-400"
        >
          <FolderPlus size={16} /> New bucket
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{error}</div>
      )}

      {loading ? (
        <div className="mt-16 flex justify-center text-zinc-500"><Loader2 className="animate-spin" /></div>
      ) : buckets.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-zinc-800 py-20 text-center">
          <HardDrive className="mx-auto text-zinc-600" size={30} />
          <p className="mt-3 text-zinc-300">No buckets yet.</p>
          <p className="mt-1 text-sm text-zinc-600">Create a bucket to store files.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-[200px_1fr] gap-6">
          <div className="space-y-1">
            {buckets.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelected(b.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                  selected === b.id ? "bg-zinc-800 font-medium text-zinc-100" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                }`}
              >
                {b.public ? <Globe size={14} /> : <Lock size={14} />}
                <span className="truncate">{b.name}</span>
              </button>
            ))}
          </div>

          <div className="min-w-0">
            {current && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium">
                    {current.public ? <Globe size={15} className="text-amber-400" /> : <Lock size={15} className="text-amber-400" />}
                    {current.name}
                    <span className="text-xs text-zinc-500">· {objects.length} files</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input ref={fileInput} type="file" multiple hidden onChange={(e) => onUpload(e.target.files)} />
                    <button
                      onClick={() => fileInput.current?.click()}
                      disabled={uploading}
                      className="flex h-8 items-center gap-1.5 rounded-lg border border-zinc-700 px-3 text-sm text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-50"
                    >
                      {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Upload
                    </button>
                    <button
                      onClick={() => onDeleteBucket(current)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-800 text-zinc-500 transition hover:border-red-500/40 hover:text-red-400"
                      title="Delete bucket"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-zinc-800">
                  {objects.length === 0 ? (
                    <div className="py-16 text-center text-sm text-zinc-600">No files. Upload one to get started.</div>
                  ) : (
                    objects.map((o) => (
                      <div key={o.name} className="flex items-center gap-3 border-b border-zinc-800/60 px-4 py-2.5 last:border-0 hover:bg-zinc-900/40">
                        <FileIcon size={16} className="text-zinc-500" />
                        <span className="min-w-0 flex-1 truncate text-sm text-zinc-200">{o.name}</span>
                        <span className="text-xs text-zinc-500">{formatBytes(o.size)}</span>
                        <button onClick={() => onDownload(o.name)} className="grid h-7 w-7 place-items-center rounded text-zinc-500 hover:text-amber-400" title="Download">
                          <Download size={15} />
                        </button>
                        <button onClick={() => onDeleteObject(o.name)} className="grid h-7 w-7 place-items-center rounded text-zinc-500 hover:text-red-400" title="Delete">
                          <X size={15} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New bucket">
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">Bucket name</label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
            placeholder="e.g. avatars"
            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-amber-500"
          />
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" checked={newPublic} onChange={(e) => setNewPublic(e.target.checked)} />
          Public bucket (anyone with a link can read)
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={() => setShowCreate(false)} className="h-9 rounded-lg border border-zinc-700 px-4 text-sm text-zinc-300 hover:bg-zinc-800">Cancel</button>
          <button onClick={submitBucket} disabled={!newName.trim()} className="h-9 rounded-lg bg-amber-500 px-4 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50">Create bucket</button>
        </div>
      </Modal>
    </div>
  );
}
