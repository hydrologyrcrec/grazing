"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectIfAuthenticated() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function redirectIfAuthenticated() {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
        cache: "no-store",
      });

      if (mounted && response.ok) {
        router.replace("/home");
      }
    }

    void redirectIfAuthenticated();

    return () => {
      mounted = false;
    };
  }, [router]);

  return null;
}
