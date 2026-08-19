type FormSelectProps<Value extends string> = Readonly<{
  id: string;
  value: Value;
  options: readonly Readonly<{
    label: string;
    value: Value;
  }>[];
  required?: boolean;
  onChange: (value: Value) => void;
}>;

export function FormSelect<Value extends string>({
  id,
  value,
  options,
  required = false,
  onChange,
}: FormSelectProps<Value>) {
  return (
    <select
      id={id}
      value={value}
      required={required}
      onChange={(event) => {
        const selected = options.find(
          (option) => option.value === event.target.value,
        );

        if (selected) onChange(selected.value);
      }}
      className="w-full rounded-sm border border-[#cbd3de] bg-white px-2.75 py-2.5 outline-none focus:border-[#248cc4] focus:ring-[3px] focus:ring-[#248cc4]/10"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
