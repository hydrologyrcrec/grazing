import { SearchIcon } from "@/components/ui/header/SearchIcon";

type SearchSubmitButtonProps = Readonly<{
  loading: boolean;
}>;

export function SearchSubmitButton({ loading }: SearchSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      aria-label={loading ? "Searching addresses" : "Search address"}
      aria-busy={loading}
      className="grid w-11 shrink-0 place-items-center border-0 border-l border-l-(--line) bg-[#f7f9fb] text-[#354154] transition-colors hover:bg-[#edf1f5] focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-[#248cc4] disabled:cursor-wait disabled:text-[#8290a2]"
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-[#aab5c4] border-t-[#354154]"
        />
      ) : (
        <SearchIcon />
      )}
    </button>
  );
}
