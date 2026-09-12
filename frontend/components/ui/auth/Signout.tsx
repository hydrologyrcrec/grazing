"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type SignoutProps = Readonly<{
  className?: string;
}>;

export default function Signout({ className }: SignoutProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignout(): Promise<void> {
    if (isSigningOut) return;

    setIsSigningOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      // Even if the request fails, leave the protected UI.
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => void handleSignout()}
      disabled={isSigningOut}
      aria-busy={isSigningOut}
    >
      {isSigningOut ? "Signing out…" : "Sign out"}
    </button>
  );
}
