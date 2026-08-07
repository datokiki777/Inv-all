import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[88px] w-full rounded border bg-surface-sunken px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint",
        "focus:outline-none focus:ring-1 focus:ring-accent",
        invalid ? "border-danger" : "border-line-input",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
