"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type { GeocodeResult } from "@/types/pasture";

type Props = {
  onAdd: () => void;
  onLocationSelected: (result: GeocodeResult) => void;
};

export default function AppHeader({ onAdd, onLocationSelected }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const searchBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!searchBoxRef.current?.contains(event.target as Node)) setResults([]);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  async function search(event: FormEvent) {
    event.preventDefault();
    const cleanQuery = query.trim();
    if (cleanQuery.length < 3) {
      setError("Enter at least 3 characters.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(cleanQuery)}`);
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Address search failed.");
      setResults(body as GeocodeResult[]);
      if (body.length === 0) setError("No matching address found.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Address search failed.");
    } finally {
      setLoading(false);
    }
  }

  function choose(result: GeocodeResult) {
    setQuery(result.label);
    setResults([]);
    setError("");
    onLocationSelected(result);
  }

  return (
    <header className="app-header">
      <h1>Ranch map</h1>
      <div className="header-actions">
        <button className="add-button" type="button" onClick={onAdd}>
          <span aria-hidden="true">＋</span> Add pasture
        </button>
        <div className="address-search" ref={searchBoxRef}>
          <form onSubmit={search} role="search">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search address"
              aria-label="Search address"
            />
            <button type="submit" disabled={loading} aria-label="Search">
              {loading ? "…" : "⌕"}
            </button>
          </form>
          {error && <p className="search-error" role="alert">{error}</p>}
          {results.length > 0 && (
            <ul className="search-results">
              {results.map((result) => (
                <li key={`${result.lat}-${result.lng}`}>
                  <button type="button" onClick={() => choose(result)}>{result.label}</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </header>
  );
}
