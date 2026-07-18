const ERRORS: Record<string, string> = {
  invalid_state: "Your sign-in session expired. Please try again.",
  exchange_failed: "Couldn’t complete sign-in with Spurs. Please try again.",
  access_denied: "You cancelled the Spurs sign-in.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message = error ? (ERRORS[error] ?? "Sign-in failed. Please try again.") : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-100">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-lg font-bold text-black">
            B
          </span>
          <div>
            <div className="text-lg font-semibold leading-tight">Spurs BaaS</div>
            <div className="text-xs text-zinc-500">Backend as a Service</div>
          </div>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">Sign in to your console</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Use your Spurs account to manage projects, data, storage and realtime.
        </p>

        {message && (
          <div className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {message}
          </div>
        )}

        <a
          href="/auth/start"
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-white font-medium text-black transition hover:bg-zinc-200"
        >
          <span className="grid h-5 w-5 place-items-center rounded bg-[#1a73e8] text-[11px] font-bold text-white">
            S
          </span>
          Continue with Spurs
        </a>

        <p className="mt-6 text-center text-xs text-zinc-600">
          Protected by Spurs Cloud identity
        </p>
      </div>
    </div>
  );
}
