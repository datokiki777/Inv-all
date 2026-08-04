import * as RadixSwitch from "@radix-ui/react-switch";
import { cn } from "@/utils/cn";

interface SwitchProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

/** The "Show in PDF" switch used throughout the invoice form's visibility toggles. */
export function Switch({ id, checked, onCheckedChange, label, disabled }: SwitchProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-center justify-between gap-3 py-1.5",
        disabled ? "opacity-40" : "cursor-pointer"
      )}
    >
      <span className="text-sm text-ink">{label}</span>
      <RadixSwitch.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-accent" : "bg-surface-sunken border border-line"
        )}
      >
        <RadixSwitch.Thumb
          className={cn(
            "block h-5 w-5 translate-x-0.5 rounded-full bg-ink transition-transform",
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          )}
        />
      </RadixSwitch.Root>
    </label>
  );
}
