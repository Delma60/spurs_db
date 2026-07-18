"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import Modal from "./Modal";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

const ConfirmContext = createContext<(opts: ConfirmOptions) => Promise<boolean>>(
  async () => false,
);

export function useConfirm() {
  return useContext(ConfirmContext);
}

export default function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback(
    (o: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        resolver.current = resolve;
        setOpts(o);
      }),
    [],
  );

  const close = (value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setOpts(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={!!opts}
        onClose={() => close(false)}
        title={opts?.title ?? "Are you sure?"}
        description={opts?.message}
      >
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={() => close(false)}
            className="h-9 rounded-lg border border-zinc-700 px-4 text-sm text-zinc-300 transition hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={() => close(true)}
            className={`h-9 rounded-lg px-4 text-sm font-medium transition ${
              opts?.danger
                ? "bg-red-500/90 text-white hover:bg-red-500"
                : "bg-amber-500 text-black hover:bg-amber-400"
            }`}
          >
            {opts?.confirmLabel ?? "Confirm"}
          </button>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
}
