import { cn } from "@/utils/cn";

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
  "aria-label"?: string;
}

/** Two/three-way toggle, e.g. client type or PDF language — cheaper on
 *  mobile than a Select for a small fixed set of options. */
export function SegmentedControl<T extends string>({ value, onChange, options, ...aria }: SegmentedControlProps<T>) {
  return (
    <div className="flex rounded border border-line bg-surface-sunken p-1" role="group" {...aria}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "flex-1 rounded px-3 py-2 text-sm font-medium transition-colors",
            value === option.value ? "bg-accent text-accent-contrast" : "text-ink-muted"
          )}
          aria-pressed={value === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
