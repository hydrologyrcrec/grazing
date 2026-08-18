"use client";

import { type FormEvent, type KeyboardEvent, useId } from "react";
import { AddressSearchResults } from "@/components/ui/header/AddressSearchResults";
import type { AddressSearchBarProps } from "@/components/ui/header/header.types";
import { SearchSubmitButton } from "@/components/ui/header/SearchSubmitButton";
import { useAddressSearch } from "@/components/ui/header/useAddressSearch";
import { useClickOutside } from "@/components/ui/header/useClickOutside";

export function AddressSearchBar({
  onLocationSelected,
}: AddressSearchBarProps) {
  const {
    query,
    results,
    loading,
    error,
    setQuery,
    search,
    selectResult,
    clearResults,
  } = useAddressSearch({ onLocationSelected });
  const searchContainerRef = useClickOutside<HTMLDivElement>(clearResults);
  const inputId = useId();
  const resultsId = `${inputId}-results`;
  const errorId = `${inputId}-error`;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void search();
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      clearResults();
    }
  }

  return (
    <div
      ref={searchContainerRef}
      className="relative w-[min(390px,42vw)] max-[720px]:min-w-0 max-[720px]:flex-1 max-[720px]:w-auto"
    >
      <form
        onSubmit={handleSubmit}
        role="search"
        className="flex h-10 overflow-hidden rounded-[5px] border border-[#bdc7d5] bg-white focus-within:border-[#248cc4] focus-within:ring-2 focus-within:ring-[#248cc4]/15"
      >
        <label htmlFor={inputId} className="sr-only">
          Search address
        </label>
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Search address"
          autoComplete="off"
          aria-describedby={error ? errorId : undefined}
          className="min-w-0 flex-1 border-0 bg-white px-3 text-[#182230] outline-none placeholder:text-[#7a8696]"
        />
        <SearchSubmitButton loading={loading} />
      </form>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="absolute right-0 top-10.75 z-2000 m-0 rounded-sm bg-white px-2.5 py-1.75 text-xs text-[#a4262c] shadow-[0_6px_18px_rgba(0,0,0,0.13)]"
        >
          {error}
        </p>
      )}

      <AddressSearchResults
        id={resultsId}
        results={results}
        onSelect={selectResult}
      />
    </div>
  );
}
