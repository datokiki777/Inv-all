import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
  /** Overrides the trigger's own border/rounded/bg — for embedding this picker inside another bordered container (e.g. NoteTemplatePicker) so the two read as one field instead of a box-in-a-box. */
  triggerClassName?: string;
}

/**
 * Fully custom in-app dropdown (Radix Select), styled to match the rest
 * of the UI — deliberately NOT a native <select>, which hands off to the
 * OS's own picker chrome (Android's system dropdown) instead of staying
 * inside the app's own visual language. Date inputs are the one
 * exception left native — the OS calendar is what people already know
 * how to use, and re-implementing it adds nothing.
 */
export function Select({ value, onChange, options, placeholder, invalid, disabled, id, triggerClassName, ...aria }: SelectProps) {
  const selected = options.find((o) => o.value === value);

  return (
    <RadixSelect.Root value={value} onValueChange={onChange} disabled={disabled}>
      <RadixSelect.Trigger
        id={id}
        aria-label={aria["aria-label"]}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded border bg-surface-sunken px-3 text-sm text-ink",
          "focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50",
          invalid ? "border-danger" : "border-line",
          triggerClassName
        )}
      >
        <RadixSelect.Value placeholder={placeholder}>{selected?.label}</RadixSelect.Value>
        <RadixSelect.Icon>
          <ChevronDown size={16} className="text-ink-faint" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          className="z-[70] max-h-[min(24rem,var(--radix-select-content-available-height))] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-line bg-surface-raised shadow-xl"
        >
          <RadixSelect.Viewport className="p-1">
            {options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                className={cn(
                  "relative flex h-11 cursor-pointer select-none items-center rounded px-3 pr-8 text-sm text-ink outline-none",
                  "data-[highlighted]:bg-surface-sunken data-[state=checked]:text-accent"
                )}
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className="absolute right-3 flex items-center">
                  <Check size={15} />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
