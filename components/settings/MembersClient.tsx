"use client";

import { useCallback, useEffect, useState } from "react";
import { UserPlus, Loader2, Trash2, Crown } from "lucide-react";
import { useConfirm } from "@/components/ui/ConfirmProvider";

interface Member {
  userId: string;
  name: string | null;
  email: string | null;
  role: string;
  isOwner: boolean;
}

export default function MembersClient({ project, canManage }: { project: string; canManage: boolean }) {
  const confirm = useConfirm();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [inviting, setInviting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/internal/members?project=${project}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load members");
      setMembers(json.members);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [project]);

  useEffect(() => {
    load();
  }, [load]);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setError(null);
    try {
      const res = await fetch(`/api/internal/members?project=${project}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not add member");
      setEmail("");
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setInviting(false);
    }
  }

  async function remove(m: Member) {
    if (!(await confirm({ title: "Remove member", message: `Remove ${m.email ?? m.userId} from this project?`, danger: true, confirmLabel: "Remove" }))) return;
    await fetch(`/api/internal/members/${m.userId}?project=${project}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <h2 className="font-medium text-zinc-100">Members</h2>
      <p className="mt-1 text-sm text-zinc-400">People with access to this project.</p>

      {canManage && (
        <form onSubmit={invite} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="teammate@example.com"
            className="h-10 flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-amber-500"
          />
          <select
            value={role} onChange={(e) => setRole(e.target.value as "member" | "admin")}
            className="h-10 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-amber-500"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit" disabled={inviting}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-medium text-black transition hover:bg-amber-400 disabled:opacity-60"
          >
            {inviting ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />} Invite
          </button>
        </form>
      )}

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <div className="mt-4">
        {loading ? (
          <div className="flex justify-center py-6 text-zinc-500"><Loader2 className="animate-spin" size={18} /></div>
        ) : (
          members.map((m) => (
            <div key={m.userId} className="flex items-center gap-3 border-t border-zinc-800/60 py-3 first:border-0">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-300">
                {(m.name ?? m.email ?? "?").charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="truncate font-medium text-zinc-200">{m.name ?? m.email ?? m.userId}</span>
                  {m.isOwner && <Crown size={13} className="text-amber-400" />}
                </div>
                {m.email && m.name && <div className="truncate text-xs text-zinc-500">{m.email}</div>}
              </div>
              <span className="text-xs capitalize text-zinc-500">{m.isOwner ? "Owner" : m.role}</span>
              {canManage && !m.isOwner && (
                <button onClick={() => remove(m)} className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500 hover:text-red-400" title="Remove">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
