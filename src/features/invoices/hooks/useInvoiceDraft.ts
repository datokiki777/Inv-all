import { useEffect, useRef } from "react";
import type { UseFormWatch } from "react-hook-form";
import { invoiceDraftRepository } from "@/storage/repositories";
import { nowIso } from "@/utils/date";
import type { InvoiceFormValues } from "@/schemas";

const AUTOSAVE_DEBOUNCE_MS = 1000;

export interface InvoiceDraftSnapshot {
  values: InvoiceFormValues;
  savedAt: string;
}

/** One-time read on mount — used to offer "restore your unsaved draft?". */
export async function loadInvoiceDraft(key: string): Promise<InvoiceDraftSnapshot | undefined> {
  const record = await invoiceDraftRepository.get(key);
  if (!record) return undefined;
  return { values: record.values as InvoiceFormValues, savedAt: record.savedAt };
}

export async function clearInvoiceDraft(key: string): Promise<void> {
  await invoiceDraftRepository.remove(key);
}

/**
 * Debounced autosave: every form change is written to invoiceDraftRepository
 * ~1s after the user stops typing, so closing the app mid-edit (accidental
 * tab close, phone locking, etc.) doesn't lose the work. This is separate
 * from the real "Save" button — it never touches invoiceRepository.
 */
export function useInvoiceDraftAutosave(key: string, watch: UseFormWatch<InvoiceFormValues>, enabled: boolean) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const subscription = watch((values) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        invoiceDraftRepository.save(key, values, nowIso());
      }, AUTOSAVE_DEBOUNCE_MS);
    });

    return () => {
      subscription.unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [key, watch, enabled]);
}
