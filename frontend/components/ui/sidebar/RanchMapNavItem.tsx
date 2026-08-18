import Link from "next/link";

export function RanchMapNavItem() {
  return (
    <Link
      href="/home"
      className="flex items-center gap-2.5 border-l-[3px] border-l-(--orange) bg-(--nav-active) px-4.5 py-3.5 text-sm font-bold text-white no-underline max-[720px]:justify-center max-[720px]:border-l-2 max-[720px]:px-0 max-[720px]:py-4"
      aria-current="page"
    >
      <span aria-hidden="true">⌖</span>
      <span className="max-[720px]:hidden">Ranch map</span>
    </Link>
  );
}
