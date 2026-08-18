"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getApiErrorMessage,
  parseGeocodeResults,
} from "@/components/ui/header/geocode.utils";
import type { LocationSelectionHandler } from "@/components/ui/header/header.types";
import type { GeocodeResult } from "@/types/pasture";

const MINIMUM_QUERY_LENGTH = 3;
const SEARCH_FAILED_MESSAGE = "Address search failed.";

type UseAddressSearchOptions = Readonly<{
  onLocationSelected: LocationSelectionHandler;
}>;

export function useAddressSearch({
  onLocationSelected,
}: UseAddressSearchOptions) {
  const [query, setQueryState] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const activeRequestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      activeRequestRef.current?.abort();
      activeRequestRef.current = null;
    };
  }, []);

  const setQuery = useCallback((value: string) => {
    activeRequestRef.current?.abort();
    activeRequestRef.current = null;
    setQueryState(value);
    setResults([]);
    setLoading(false);
    setError("");
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  const selectResult = useCallback(
    (result: GeocodeResult) => {
      setQueryState(result.label);
      setResults([]);
      setError("");
      onLocationSelected(result);
    },
    [onLocationSelected],
  );

  const search = useCallback(async () => {
    const cleanQuery = query.trim();

    if (cleanQuery.length < MINIMUM_QUERY_LENGTH) {
      setResults([]);
      setError(`Enter at least ${MINIMUM_QUERY_LENGTH} characters.`);
      return;
    }

    activeRequestRef.current?.abort();
    const controller = new AbortController();
    activeRequestRef.current = controller;
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/geocode?q=${encodeURIComponent(cleanQuery)}`,
        {
          method: "GET",
          signal: controller.signal,
          headers: { Accept: "application/json" },
        },
      );

      const body: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getApiErrorMessage(body, SEARCH_FAILED_MESSAGE));
      }

      const nextResults = parseGeocodeResults(body);
      setResults(nextResults);

      if (nextResults.length === 0) {
        setError("No matching address found.");
      }
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") {
        return;
      }

      setResults([]);
      setError(
        reason instanceof Error ? reason.message : SEARCH_FAILED_MESSAGE,
      );
    } finally {
      if (activeRequestRef.current === controller) {
        activeRequestRef.current = null;
        setLoading(false);
      }
    }
  }, [query]);

  return {
    query,
    results,
    loading,
    error,
    setQuery,
    search,
    selectResult,
    clearResults,
  } as const;
}
