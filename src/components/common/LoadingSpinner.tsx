interface LoadingSpinnerProps {
  label?: string;
}

export function LoadingSpinner({ label }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-muted">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent" />
      {label ? <p className="text-sm">{label}</p> : null}
    </div>
  );
}
