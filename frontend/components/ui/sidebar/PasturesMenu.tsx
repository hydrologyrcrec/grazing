"use client";

import { useId, useState } from "react";
import { PastureList } from "@/components/ui/sidebar/PastureList";
import { PasturesToggle } from "@/components/ui/sidebar/PasturesToggle";
import type { PasturesMenuProps } from "@/components/ui/sidebar/sidebar.types";

export function PasturesMenu({
  pastures,
  selectedPastureId,
  onPastureSelect,
}: PasturesMenuProps) {
  const [isOpen, setIsOpen] = useState(true);
  const listId = useId();

  return (
    <section aria-label="Saved pastures">
      <PasturesToggle
        isOpen={isOpen}
        controlsId={listId}
        onToggle={() => setIsOpen((current) => !current)}
      />

      {isOpen && (
        <PastureList
          id={listId}
          pastures={pastures}
          selectedPastureId={selectedPastureId}
          onPastureSelect={onPastureSelect}
        />
      )}
    </section>
  );
}
