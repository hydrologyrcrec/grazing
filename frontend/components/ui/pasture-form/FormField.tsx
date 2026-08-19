import type { FormFieldProps } from "@/components/ui/pasture-form/pasture-form.types";

export function FormField({
  id,
  label,
  required = false,
  children,
}: FormFieldProps) {
  return (
    <div className="grid gap-1.75">
      <label htmlFor={id} className="text-[13px] font-bold text-[#354154]">
        {label}
        {required && (
          <span className="ml-1 text-[#c9343b]" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
    </div>
  );
}
