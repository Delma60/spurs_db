"use client";

import { useState } from "react";
import { Save, Server, Mail, KeyRound, Check } from "lucide-react";
import { saveSmtp, saveTemplates, type AuthSettings, type Smtp, type Templates } from "@/lib/api/auth-users-client";

function useSaved() {
  const [saved, setSaved] = useState(false);
  return {
    saved,
    flash: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    },
  };
}

const inputCls = "h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-amber-500";
const labelCls = "mb-1.5 block text-xs font-medium text-zinc-400";

export default function TemplatesTab({ project, settings }: { project: string; settings: AuthSettings }) {
  const [smtp, setSmtp] = useState<Smtp>(settings.smtp ?? {});
  const [templates, setTemplates] = useState<Templates>(settings.templates);
  const [error, setError] = useState<string | null>(null);
  const smtpSaved = useSaved();
  const verifySaved = useSaved();
  const resetSaved = useSaved();

  const doSaveSmtp = async () => {
    setError(null);
    try { await saveSmtp(project, smtp); smtpSaved.flash(); } catch (e) { setError((e as Error).message); }
  };
  const doSaveTemplates = async (which: "verify" | "reset") => {
    setError(null);
    try {
      await saveTemplates(project, templates);
      (which === "verify" ? verifySaved : resetSaved).flash();
    } catch (e) { setError((e as Error).message); }
  };

  const setTpl = (which: "verify" | "reset", field: "subject" | "body", value: string) =>
    setTemplates((t) => ({ ...t, [which]: { ...t[which], [field]: value } }));

  const SaveBtn = ({ onClick, saved }: { onClick: () => void; saved: boolean }) => (
    <button onClick={onClick} className="flex h-9 items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 text-sm font-medium text-black transition hover:bg-amber-400">
      {saved ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save</>}
    </button>
  );

  return (
    <div className="mt-6 max-w-3xl space-y-6">
      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{error}</div>}

      {/* SMTP */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Server size={16} className="text-amber-400" />
          <h2 className="font-medium text-zinc-100">SMTP settings</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><label className={labelCls}>Host</label>
            <input value={smtp.host ?? ""} onChange={(e) => setSmtp({ ...smtp, host: e.target.value })} placeholder="smtp.example.com" className={inputCls} /></div>
          <div><label className={labelCls}>Port</label>
            <input type="number" value={smtp.port ?? ""} onChange={(e) => setSmtp({ ...smtp, port: Number(e.target.value) || undefined })} placeholder="587" className={inputCls} /></div>
          <div><label className={labelCls}>From address</label>
            <input value={smtp.from ?? ""} onChange={(e) => setSmtp({ ...smtp, from: e.target.value })} placeholder="no-reply@example.com" className={inputCls} /></div>
          <div><label className={labelCls}>Username</label>
            <input value={smtp.username ?? ""} onChange={(e) => setSmtp({ ...smtp, username: e.target.value })} className={inputCls} /></div>
          <div><label className={labelCls}>Password</label>
            <input type="password" value={smtp.password ?? ""} onChange={(e) => setSmtp({ ...smtp, password: e.target.value })} className={inputCls} /></div>
          <label className="flex items-center gap-2 text-sm text-zinc-300 sm:col-span-2">
            <input type="checkbox" checked={!!smtp.secure} onChange={(e) => setSmtp({ ...smtp, secure: e.target.checked })} /> Use TLS/SSL
          </label>
        </div>
        <div className="mt-4 flex justify-end"><SaveBtn onClick={doSaveSmtp} saved={smtpSaved.saved} /></div>
      </section>

      {/* Verify template */}
      <TemplateCard
        icon={<Mail size={16} className="text-amber-400" />}
        title="Email verification template"
        tpl={templates.verify}
        onSubject={(v) => setTpl("verify", "subject", v)}
        onBody={(v) => setTpl("verify", "body", v)}
        save={<SaveBtn onClick={() => doSaveTemplates("verify")} saved={verifySaved.saved} />}
      />

      {/* Reset template */}
      <TemplateCard
        icon={<KeyRound size={16} className="text-amber-400" />}
        title="Password reset template"
        tpl={templates.reset}
        onSubject={(v) => setTpl("reset", "subject", v)}
        onBody={(v) => setTpl("reset", "body", v)}
        save={<SaveBtn onClick={() => doSaveTemplates("reset")} saved={resetSaved.saved} />}
      />
    </div>
  );
}

function TemplateCard({ icon, title, tpl, onSubject, onBody, save }: {
  icon: React.ReactNode; title: string; tpl: { subject: string; body: string };
  onSubject: (v: string) => void; onBody: (v: string) => void; save: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="mb-4 flex items-center gap-2">{icon}<h2 className="font-medium text-zinc-100">{title}</h2></div>
      <div className="space-y-4">
        <div><label className={labelCls}>Subject</label>
          <input value={tpl.subject} onChange={(e) => onSubject(e.target.value)} className={inputCls} /></div>
        <div><label className={labelCls}>Body</label>
          <textarea value={tpl.body} onChange={(e) => onBody(e.target.value)} rows={6}
            className="w-full resize-y rounded-lg border border-zinc-800 bg-zinc-950 p-3 font-mono text-sm text-zinc-100 outline-none focus:border-amber-500" />
          <p className="mt-1.5 text-xs text-zinc-600">Placeholders: <code className="text-zinc-400">{"{{email}}"}</code>, <code className="text-zinc-400">{"{{link}}"}</code></p>
        </div>
      </div>
      <div className="mt-4 flex justify-end">{save}</div>
    </section>
  );
}
