"use client";

import { useRef } from "react";
import { useConfirm } from "@/components/ui/ConfirmProvider";

// A server-action form that asks for confirmation (via the Modal confirm)
// before actually submitting.
export default function ConfirmForm({
  action,
  hidden,
  title,
  message,
  confirmLabel,
  className,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  hidden?: Record<string, string>;
  title?: string;
  message: string;
  confirmLabel?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const confirm = useConfirm();
  const bypass = useRef(false);

  return (
    <form
      action={action}
      className={className}
      onSubmit={async (e) => {
        if (bypass.current) {
          bypass.current = false;
          return; // second pass — allow the real submit
        }
        e.preventDefault();
        const form = e.currentTarget;
        if (await confirm({ title, message, danger: true, confirmLabel })) {
          bypass.current = true;
          form.requestSubmit();
        }
      }}
    >
      {hidden &&
        Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {children}
    </form>
  );
}
