"use client";

import { useEffect, useState } from "react";
import { getPastures } from "@/lib/storage";
import type { Pasture } from "@/types/pasture";
import Logout from "./ui/auth/Logout";

type Props = {
  selectedPastureId: string | null;
  onPastureSelect: (pastureId: string) => void;
};

export default function AppSidebar({
  selectedPastureId,
  onPastureSelect,
}: Props) {
  const [pastures, setPastures] = useState<Pasture[]>([]);
  const [pasturesOpen, setPasturesOpen] = useState(true);

  useEffect(() => {
    const savedPastures = getPastures();

    const sortedPastures = [...savedPastures].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

    setPastures(sortedPastures);
  }, []);

  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="brand-mark" aria-label="Grazing home">
        G
      </div>

      <nav>
        <a className="sidebar-link active" href="/home" aria-current="page">
          <span aria-hidden="true">⌖</span>
          <span>Ranch map</span>
        </a>

        <div className="pastures-menu">
          <button
            type="button"
            className="sidebar-link pastures-toggle"
            onClick={() => setPasturesOpen((current) => !current)}
            aria-expanded={pasturesOpen}
            aria-controls="saved-pastures-list"
          >
            <span aria-hidden="true">▱</span>
            <span>Pastures</span>

            <span
              className={`pastures-chevron ${pasturesOpen ? "open" : ""}`}
              aria-hidden="true"
            >
              ▾
            </span>
          </button>

          {pasturesOpen && (
            <div id="saved-pastures-list" className="pastures-list">
              {pastures.length === 0 ? (
                <p className="empty-pastures">No pastures added</p>
              ) : (
                pastures.map((pasture) => (
                  <button
                    key={pasture.id}
                    type="button"
                    className={`pasture-list-item ${
                      selectedPastureId === pasture.id ? "selected" : ""
                    }`}
                    onClick={() => onPastureSelect(pasture.id)}
                  >
                    <span
                      className="pasture-color"
                      style={{
                        backgroundColor: pasture.color,
                      }}
                      aria-hidden="true"
                    />

                    <span className="pasture-list-name">{pasture.name}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <Logout></Logout>
      </nav>
    </aside>
  );
}
