import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded border bg-surface-sunken px-3 text-sm text-ink placeholder:text-ink-faint",
        "focus:outline-none focus:ring-1 focus:ring-accent",
        invalid ? "border-danger" : "border-line-input",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
