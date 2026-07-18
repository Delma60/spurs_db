import { SERVICES } from "@/lib/services";

export default function ComingSoon({ slug }: { slug: string }) {
  const svc = SERVICES.find((s) => s.slug === slug);
  if (!svc) return null;

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">{svc.name}</h1>
      <p className="mt-1 text-sm text-zinc-500">{svc.desc}</p>
      <div className="mt-8 rounded-xl border border-dashed border-zinc-800 py-20 text-center">
        <p className="text-zinc-300">{svc.name} is coming to this project.</p>
        <p className="mt-1 text-sm text-zinc-600">
          {svc.status === "next" ? "We’re building it now." : "Planned for a future release."}
        </p>
      </div>
    </div>
  );
}
