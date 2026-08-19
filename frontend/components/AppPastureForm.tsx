"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  usePastureCreation,
  PastureFormCard,
  PastureFormLoading,
} from "@/components/ui/pasture-form";

export default function AppPastureForm() {
  const router = useRouter();
  const { boundary } = usePastureCreation();

  useEffect(() => {
    if (!boundary) router.replace("/home");
  }, [boundary, router]);

  if (!boundary) return <PastureFormLoading />;

  return (
    <main className="min-h-screen bg-[#eef1f4] px-4.5 py-9">
      <PastureFormCard boundary={boundary} />
    </main>
  );
}
