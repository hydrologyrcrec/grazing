"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  PastureFormCard,
  PastureFormLoading,
  usePastureDraft,
} from "@/components/ui/pasture-form";

export default function AppPastureForm() {
  const router = useRouter();
  const draft = usePastureDraft();

  useEffect(() => {
    if (draft === null) router.replace("/home");
  }, [draft, router]);

  if (!draft) return <PastureFormLoading />;

  return (
    <main className="min-h-screen bg-[#eef1f4] px-4.5 py-9">
      <PastureFormCard key={draft.createdAt} draft={draft} />
    </main>
  );
}
