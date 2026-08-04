import type { ReactNode } from "react";
import { Label } from "./Label";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  /** Optional content aligned to the right of the label, e.g. a "Show in PDF" switch. */
  headerRight?: ReactNode;
  children: ReactNode;
}

/** Label + control + error/hint text, the one wrapper every form field uses. */
export function FormField({ label, htmlFor, required, error, hint, headerRight, children }: FormFieldProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <Label htmlFor={htmlFor} required={required} className="mb-0">
          {label}
        </Label>
        {headerRight}
      </div>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
}
