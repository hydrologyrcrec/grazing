import type { HeaderTitleProps } from "@/components/ui/header/header.types";

export function HeaderTitle({ children }: HeaderTitleProps) {
  return (
    <h1 className="m-0 text-xl font-bold text-(--ink) max-[720px]:hidden">
      {children}
    </h1>
  );
}
