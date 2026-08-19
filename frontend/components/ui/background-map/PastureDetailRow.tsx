import type { PastureDetailRowProps } from "@/components/ui/background-map/background-map.types";

export function PastureDetailRow({
  label,
  value,
}: PastureDetailRowProps) {
  return (
    <div className="border-t border-[#e6eaf0] py-2.75">
      <dt className="text-xs font-bold uppercase text-[#687588]">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap">{value}</dd>
    </div>
  );
}
