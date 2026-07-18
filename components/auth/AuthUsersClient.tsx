"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, Search, Plus, RefreshCw, Trash2, Loader2, Smartphone, UserRound, Globe, ShieldCheck } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import UsageChart from "./UsageChart";
import TemplatesTab from "./TemplatesTab";
import {
  fetchEndUsers, createEndUser, deleteEndUser, fetchAuthSettings, setProvider, setAllowSignups,
  type EndUser, type AuthSettings,
} from "@/lib/api/auth-users-client";

const TABS = ["Users", "Sign-in method", "Templates", "Usage", "Settings"] as const;
type Tab = (typeof TABS)[number];
const ACTIVE: Tab[] = ["Users", "Sign-in method", "Templates", "Usage", "Settings"];

interface Provider { key: string; name: string; icon?: typeof Mail; spurs?: boolean }
const PROVIDERS: Provider[] = [
  { key: "password", name: "Email / Password", icon: Mail },
  { key: "spurs", name: "Spurs SSO", spurs: true },
  { key: "google", name: "Google", icon: Globe },
  { key: "phone", name: "Phone", icon: Smartphone },
  { key: "anonymous", name: "Anonymous", icon: UserRound },
];

function fmt(d: string | null): string {
  return d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
}

function ProviderIcon({ p }: { p: Provider }) {
  if (p.spurs)
    return <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#1a73e8] text-sm font-bold text-white">S</span>;
  const Icon = p.icon ?? Mail;
  return <span className="grid h-9 w-9 place-items-center rounded-lg bg-zinc-800 text-zinc-300"><Icon size={17} /></span>;
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`relative h-6 w-11 rounded-full transition ${on ? "bg-emerald-500" : "bg-zinc-700"}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

export default function AuthUsersClient({ project }: { project: string }) {
  const confirm = useConfirm();
  const [tab, setTab] = useState<Tab>("Users");
  const [users, setUsers] = useState<EndUser[]>([]);
  const [settings, setSettings] = useState<AuthSettings>({
    providers: {},
    allowSignups: true,
    smtp: {},
    templates: { verify: { subject: "", body: "" }, reset: { subject: "", body: "" } },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, s] = await Promise.all([fetchEndUsers(project), fetchAuthSettings(project)]);
      setUsers(u);
      setSettings(s);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [project]);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    setError(null);
    try {
      await createEndUser(project, email, password);
      setShowAdd(false); setEmail(""); setPassword("");
      await load();
    } catch (e) { setError((e as Error).message); }
  };
  const remove = async (u: EndUser) => {
    if (!(await confirm({ title: "Delete user", message: `Delete ${u.email}?`, danger: true, confirmLabel: "Delete" }))) return;
    await deleteEndUser(project, u.id); await load();
  };
  const toggleProvider = async (key: string, enabled: boolean) => {
    setSettings(await setProvider(project, key, enabled));
  };
  const toggleSignups = async () => {
    setSettings(await setAllowSignups(project, !settings.allowSignups));
  };

  const filtered = users.filter((u) => u.email.toLowerCase().includes(query.toLowerCase()) || u.id.includes(query));
  const enabled = PROVIDERS.filter((p) => settings.providers[p.key]);
  const available = PROVIDERS.filter((p) => !settings.providers[p.key]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Authentication</h1>

      <div className="mt-4 flex gap-6 border-b border-zinc-800 text-sm">
        {TABS.map((t) =>
          ACTIVE.includes(t) ? (
            <button key={t} onClick={() => setTab(t)} className={`-mb-px border-b-2 pb-2.5 ${tab === t ? "border-amber-500 font-medium text-zinc-100" : "border-transparent text-zinc-400 hover:text-zinc-200"}`}>{t}</button>
          ) : (
            <span key={t} className="-mb-px cursor-default border-b-2 border-transparent pb-2.5 text-zinc-600">{t}</span>
          ),
        )}
      </div>

      {error && <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{error}</div>}

      {loading ? (
        <div className="mt-16 flex justify-center text-zinc-500"><Loader2 className="animate-spin" /></div>
      ) : tab === "Users" ? (
        <>
          <div className="mt-5 flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by email address or user UID"
                className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-9 pr-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-amber-500" />
            </div>
            <button onClick={() => setShowAdd(true)} className="flex h-10 items-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-medium text-black transition hover:bg-amber-400"><Plus size={16} /> Add user</button>
            <button onClick={load} className="grid h-10 w-10 place-items-center rounded-lg border border-zinc-800 text-zinc-400 hover:bg-zinc-800"><RefreshCw size={15} /></button>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50 text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-4 py-3 font-medium">Identifier</th><th className="px-4 py-3 font-medium">Providers</th>
                  <th className="px-4 py-3 font-medium">Created</th><th className="px-4 py-3 font-medium">Signed In</th>
                  <th className="px-4 py-3 font-medium">User UID</th><th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-sm text-zinc-600">{users.length === 0 ? "No users yet — they appear when they sign up through your app." : "No matches."}</td></tr>
                ) : filtered.map((u) => (
                  <tr key={u.id} className="group border-b border-zinc-800/60 last:border-0 hover:bg-zinc-900/40">
                    <td className="px-4 py-3 text-zinc-200">{u.email}</td>
                    <td className="px-4 py-3"><Mail size={16} className="text-zinc-500" /></td>
                    <td className="px-4 py-3 text-zinc-400">{fmt(u.createdAt)}</td>
                    <td className="px-4 py-3 text-zinc-400">{fmt(u.lastSignInAt)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">{u.id.slice(0, 16)}…</td>
                    <td className="px-2"><button onClick={() => remove(u)} className="grid h-7 w-7 place-items-center rounded text-zinc-600 opacity-0 transition hover:text-red-400 group-hover:opacity-100"><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center justify-end gap-3 text-xs text-zinc-500"><span>Rows per page: 50</span><span>1–{filtered.length} of {users.length}</span></div>
        </>
      ) : tab === "Sign-in method" ? (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-zinc-400">Providers your users can sign in with</span>
            <button onClick={() => setShowAddProvider(true)} disabled={available.length === 0} className="flex h-9 items-center gap-2 rounded-lg bg-amber-500 px-3.5 text-sm font-medium text-black transition hover:bg-amber-400 disabled:opacity-50"><Plus size={15} /> Add new provider</button>
          </div>
          <div className="overflow-hidden rounded-xl border border-zinc-800">
            {enabled.length === 0 ? (
              <div className="py-16 text-center">
                <ShieldCheck className="mx-auto text-zinc-600" size={28} />
                <p className="mt-3 text-sm text-zinc-400">No sign-in providers enabled.</p>
                <p className="mt-1 text-xs text-zinc-600">Add a provider to let users sign in to your app.</p>
              </div>
            ) : enabled.map((p) => (
              <div key={p.key} className="flex items-center gap-3 border-b border-zinc-800/60 px-4 py-3.5 last:border-0">
                <ProviderIcon p={p} />
                <div className="flex-1">
                  <div className="text-sm text-zinc-200">{p.name}</div>
                  {p.spurs && <div className="text-xs text-zinc-500">Sign in with Spurs Cloud identity</div>}
                </div>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">Enabled</span>
                <Toggle on onClick={() => toggleProvider(p.key, false)} />
              </div>
            ))}
          </div>
        </div>
      ) : tab === "Usage" ? (
        <UsageChart users={users} providersEnabled={enabled.length} />
      ) : tab === "Templates" ? (
        <TemplatesTab project={project} settings={settings} />
      ) : (
        /* Settings */
        <div className="mt-6 max-w-2xl rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-zinc-200">Allow new sign-ups</div>
              <div className="mt-1 text-sm text-zinc-500">When off, existing users can sign in but new accounts can’t be created through your app.</div>
            </div>
            <Toggle on={settings.allowSignups} onClick={toggleSignups} />
          </div>
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add a user">
        <div className="mt-4 space-y-4">
          <div><label className="mb-1.5 block text-xs font-medium text-zinc-400">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} autoFocus type="email" placeholder="user@example.com" className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-amber-500" /></div>
          <div><label className="mb-1.5 block text-xs font-medium text-zinc-400">Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="At least 8 characters" className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-amber-500" /></div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={() => setShowAdd(false)} className="h-9 rounded-lg border border-zinc-700 px-4 text-sm text-zinc-300 hover:bg-zinc-800">Cancel</button>
          <button onClick={add} disabled={!email.trim() || password.length < 8} className="h-9 rounded-lg bg-amber-500 px-4 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50">Add user</button>
        </div>
      </Modal>

      <Modal open={showAddProvider} onClose={() => setShowAddProvider(false)} title="Add a sign-in provider">
        <div className="mt-4 space-y-2">
          {available.length === 0 ? (
            <p className="py-4 text-center text-sm text-zinc-600">All providers are already enabled.</p>
          ) : available.map((p) => (
            <button key={p.key} onClick={async () => { await toggleProvider(p.key, true); setShowAddProvider(false); }}
              className="flex w-full items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-left transition hover:border-amber-500/50 hover:bg-zinc-900">
              <ProviderIcon p={p} />
              <span className="flex-1 text-sm text-zinc-200">{p.name}</span>
              <Plus size={16} className="text-zinc-500" />
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
