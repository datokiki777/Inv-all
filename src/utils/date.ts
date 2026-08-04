export function nowIso(): string {
  return new Date().toISOString();
}

export function todayDateOnly(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(iso));
}
