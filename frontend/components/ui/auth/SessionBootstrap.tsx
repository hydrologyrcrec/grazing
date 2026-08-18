"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SessionBootstrap() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function verifySession() {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
        cache: "no-store",
      });

      if (mounted && response.status === 401) {
        router.replace("/login");
      }
    }

    void verifySession();

    return () => {
      mounted = false;
    };
  }, [router]);

  return null;
}
