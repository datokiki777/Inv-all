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
        {/* min-w-0 lets this side actually shrink/truncate instead of
            forcing the row to overflow — flex items default to
            min-width: auto (their content's natural width as a floor),
            so without this, a slightly wider label (e.g. iOS's system
            font rendering the same text a few px wider than Android's)
            was enough to push the row past the screen edge on some
            devices but not others, even at the identical viewport width. */}
        <Label htmlFor={htmlFor} required={required} className="mb-0 min-w-0 truncate">
          {label}
        </Label>
        {headerRight ? <div className="shrink-0">{headerRight}</div> : null}
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
