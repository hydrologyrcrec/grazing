"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Logout() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

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
      className="sidebar-logout"
      onClick={handleLogout}
      disabled={isLoggingOut}
      aria-busy={isLoggingOut}
    >
      {isLoggingOut ? "Logging out…" : "Log out"}
    </button>
  );
}
