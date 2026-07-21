"use client";

import { SpursAccountMenu } from "@spurs-cloud/accounts/react";

/**
 * The shared Spurs account avatar, branded for the BaaS console (amber). The
 * component lives in `@spurs-cloud/accounts` so every Spurs app shows the same menu.
 */
export default function UserMenu({ name, email }: { name?: string; email?: string }) {
  return (
    <SpursAccountMenu
      user={{ name, email }}
      accent="#f59e0b"
      accentTo="#ea580c"
      theme="dark"
      signOutUrl="/auth/logout"
    />
  );
}
