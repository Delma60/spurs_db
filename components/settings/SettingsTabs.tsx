"use client";

import { useState } from "react";
import { renameProjectAction, deleteProjectAction } from "@/lib/actions/project-actions";
import ConfirmForm from "@/components/shared/ConfirmForm";
import ApiKeysClient from "@/components/settings/ApiKeysClient";
import MembersClient from "@/components/settings/MembersClient";

interface Props {
  project: { id: string; name: string; slug: string; region: string };
  canManage: boolean;
}

const TABS = ["General", "Members", "API keys", "Danger Zone"] as const;
type Tab = (typeof TABS)[number];

export default function SettingsTabs({ project, canManage }: Props) {
  const [tab, setTab] = useState<Tab>("General");

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex gap-1 border-b border-zinc-800">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm transition ${
              tab === t
                ? "border-amber-500 font-medium text-zinc-100"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "General" && (
        <div className="space-y-6">
          <form action={renameProjectAction} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <input type="hidden" name="id" value={project.id} />
            <label className="block text-sm font-medium text-zinc-200">Project name</label>
            <p className="mt-1 text-sm text-zinc-500">Shown across the console.</p>
            <div className="mt-3 flex gap-2">
              <input
                name="name" defaultValue={project.name} required minLength={2} maxLength={64}
                className="h-10 flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-amber-500"
              />
              <button className="h-10 rounded-lg bg-amber-500 px-4 text-sm font-medium text-black hover:bg-amber-400">Save</button>
            </div>
          </form>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="grid grid-cols-[120px_1fr] gap-y-3 text-sm">
              <span className="text-zinc-500">Slug</span><span className="text-zinc-400">{project.slug}</span>
              <span className="text-zinc-500">Region</span><span className="text-zinc-400">{project.region}</span>
              <span className="text-zinc-500">Project ID</span><span className="truncate font-mono text-xs text-zinc-500">{project.id}</span>
            </div>
          </div>
        </div>
      )}

      {tab === "Members" && <MembersClient project={project.id} canManage={canManage} />}

      {tab === "API keys" && (
        <div>
          <ApiKeysClient project={project.id} />
          <p className="mt-3 text-xs text-zinc-600">
            Public API base: <code className="text-zinc-400">/api/v1/db/&lt;table&gt;</code> · send{" "}
            <code className="text-zinc-400">Authorization: Bearer &lt;key&gt;</code>
          </p>
        </div>
      )}

      {tab === "Danger Zone" && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5">
          <h2 className="font-medium text-red-300">Delete project</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Permanently remove this project and everything in it. This cannot be undone.
          </p>
          {canManage ? (
            <ConfirmForm
              action={deleteProjectAction}
              hidden={{ id: project.id }}
              title="Delete project"
              message={`Delete "${project.name}" and everything in it? This cannot be undone.`}
              confirmLabel="Delete project"
              className="mt-4"
            >
              <button className="h-9 rounded-lg border border-red-500/40 bg-red-500/10 px-4 text-sm font-medium text-red-300 transition hover:bg-red-500/20">
                Delete this project
              </button>
            </ConfirmForm>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">Only the project owner can delete it.</p>
          )}
        </div>
      )}
    </div>
  );
}
