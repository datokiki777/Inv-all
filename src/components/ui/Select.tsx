import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

/**
 * Native <select> rather than a Radix listbox: on Android it opens the
 * system picker, which is faster to use and more accessible than a
 * custom-rendered dropdown for a fixed short option list.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "h-11 w-full appearance-none rounded border bg-surface-sunken px-3 pr-9 text-sm text-ink",
          "focus:outline-none focus:ring-1 focus:ring-accent",
          invalid ? "border-danger" : "border-line",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint" />
    </div>
  )
);
Select.displayName = "Select";
