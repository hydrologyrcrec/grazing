import type { PastureFormErrorProps } from "@/components/ui/pasture-form/pasture-form.types";

export function PastureFormError({ message }: PastureFormErrorProps) {
  return (
    <div
      className="rounded-sm bg-[#fdebee] px-3 py-2.5 text-[13px] text-[#8b1e26]"
      role="alert"
    >
      {message}
    </div>
  );
}
