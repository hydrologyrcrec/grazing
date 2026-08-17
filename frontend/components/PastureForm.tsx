"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearDraft, getDeviceId, getDraft, getPastures, savePastures } from "@/lib/storage";
import type { PastureDraft } from "@/types/pasture";

const COLORS = [
  { label: "Sky blue", value: "#28a8cf" },
  { label: "Pasture green", value: "#36a269" },
  { label: "Sunflower", value: "#f5a623" },
  { label: "Violet", value: "#7b61a8" },
];

export default function PastureForm() {
  const router = useRouter();
  const [draft, setDraft] = useState<PastureDraft | null>(null);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [grazeableArea, setGrazeableArea] = useState("");
  const [landUse, setLandUse] = useState<"Grazing" | "Hay">("Grazing");
  const [grassType, setGrassType] = useState("Natural grasses");
  const [color, setColor] = useState(COLORS[0].value);
  const [description, setDescription] = useState("");
  const [fsaIds, setFsaIds] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const storedDraft = getDraft();
    if (!storedDraft) {
      router.replace("/home");
      return;
    }
    setDraft(storedDraft);
    setGrazeableArea(storedDraft.areaAcres.toFixed(2));
    setReady(true);
  }, [router]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    const grazeable = Number(grazeableArea);
    if (!name.trim()) return setError("Pasture name is required.");
    if (!Number.isFinite(grazeable) || grazeable <= 0 || grazeable > draft.areaAcres + 0.01) {
      return setError("Grazeable area must be greater than 0 and no larger than total area.");
    }

    const now = new Date().toISOString();
    const pasture = {
      ...draft,
      id: crypto.randomUUID(),
      deviceId: getDeviceId(),
      name: name.trim(),
      grazeableAreaAcres: grazeable,
      landUse,
      grassType,
      color,
      description: description.trim(),
      fsaIds: fsaIds.trim(),
      updatedAt: now,
    };
    savePastures([...getPastures(), pasture]);
    clearDraft();
    router.push("/home");
  }

  function cancel() {
    clearDraft();
    router.push("/home");
  }

  if (!ready || !draft) return <main className="form-loading">Loading pasture…</main>;

  return (
    <main className="form-page">
      <section className="form-card">
        <header className="form-header">
          <div>
            <p>Ranch map</p>
            <h1>Add pasture</h1>
          </div>
          <button type="button" onClick={cancel} aria-label="Close">×</button>
        </header>
        <form onSubmit={submit}>
          {error && <div className="form-error" role="alert">{error}</div>}
          <label>Pasture name <span>*</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. North pasture" required autoFocus /></label>
          <label>Total area <span>*</span><div className="input-unit"><input value={draft.areaAcres.toFixed(2)} readOnly /><span>ac</span></div></label>
          <label>Grazeable or arable area <span>*</span><div className="input-unit"><input type="number" min="0.01" max={draft.areaAcres.toFixed(2)} step="0.01" value={grazeableArea} onChange={(e) => setGrazeableArea(e.target.value)} required /><span>ac</span></div></label>
          <label>Land use <span>*</span><select value={landUse} onChange={(e) => setLandUse(e.target.value as "Grazing" | "Hay")}><option>Grazing</option><option>Hay</option></select></label>
          <label>Grass type <span>*</span><select value={grassType} onChange={(e) => setGrassType(e.target.value)}><option>Natural grasses</option><option>Bahiagrass</option><option>Bermudagrass</option><option>Ryegrass</option><option>Other</option></select></label>
          <label>Color on map <span>*</span><select value={color} onChange={(e) => setColor(e.target.value)}>{COLORS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <label>Description<textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional pasture notes" /></label>
          <label>Farm Service Agency IDs<input value={fsaIds} onChange={(e) => setFsaIds(e.target.value)} placeholder="Optional farm and tract IDs" /></label>
          <footer className="form-actions"><button className="secondary-button" type="button" onClick={cancel}>Cancel</button><button className="save-button" type="submit">Save pasture</button></footer>
        </form>
      </section>
    </main>
  );
}
