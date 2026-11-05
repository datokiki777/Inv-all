import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { TEMPLATE_IDS, TEMPLATE_THUMBNAILS, TEMPLATE_LARGE_PREVIEWS } from "@/assets/template-thumbnails";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import type { InvoiceTemplateId } from "@/types";

/** One design's preview picture — shared by the picker and the change-confirmation dialog. */
export function TemplateThumbnail({ id, className }: { id: InvoiceTemplateId; className?: string }) {
  return (
    <img
      src={TEMPLATE_THUMBNAILS[id]}
      alt=""
      draggable={false}
      decoding="async"
      className={cn("block aspect-[360/510] w-full bg-white object-cover object-top", className)}
    />
  );
}

interface TemplatePickerProps {
  value: InvoiceTemplateId;
  onChange: (id: InvoiceTemplateId) => void;
  ariaLabel: string;
  id?: string;
}

/**
 * Visual replacement for a plain <select> of PDF designs: a horizontally
 * scrollable row of A4 thumbnails with the design name underneath, so a
 * design can be chosen by how it LOOKS rather than by its name alone.
 *
 * Tapping a card does NOT select it — it opens an enlarged view of that
 * design, where "Use this design" is the explicit, deliberate action. That
 * makes an accidental tap harmless (it just opens a picture) and lets the
 * whole page be inspected before committing. The picker itself stays
 * purely presentational and controlled: it never decides whether a pick
 * is applied (callers wrap onChange in their own confirmation if needed).
 */
export function TemplatePicker({ value, onChange, ariaLabel, id }: TemplatePickerProps) {
  const { t } = useTranslation(["common", "invoice"]);
  const listRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const [previewId, setPreviewId] = useState<InvoiceTemplateId | null>(null);

  // On first show, bring the current design into view — with five cards
  // and ~4 visible, the last ones would otherwise start off-screen.
  useEffect(() => {
    const list = listRef.current;
    const selected = selectedRef.current;
    if (!list || !selected) return;
    list.scrollLeft = selected.offsetLeft - (list.clientWidth - selected.offsetWidth) / 2;
  }, []);

  return (
    <>
      <div
        ref={listRef}
        id={id}
        role="group"
        aria-label={ariaLabel}
        className="no-scrollbar relative -mx-1 flex gap-3 overflow-x-auto px-1 py-1"
      >
        {TEMPLATE_IDS.map((templateId) => {
          const selected = templateId === value;
          return (
            <button
              key={templateId}
              ref={selected ? selectedRef : undefined}
              type="button"
              data-template-id={templateId}
              aria-haspopup="dialog"
              aria-current={selected ? "true" : undefined}
              onClick={() => setPreviewId(templateId)}
              className="group flex w-24 shrink-0 flex-col items-center gap-1.5 focus:outline-none"
            >
              <span
                className={cn(
                  "relative block w-full overflow-hidden rounded-md border-2 transition-colors group-focus-visible:ring-2 group-focus-visible:ring-accent",
                  selected ? "border-accent" : "border-line group-active:border-ink-faint"
                )}
              >
                <TemplateThumbnail id={templateId} />
                {selected ? (
                  <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-contrast">
                    <Check size={12} strokeWidth={3} />
                  </span>
                ) : null}
              </span>
              <span className={cn("text-xs", selected ? "font-medium text-accent" : "text-ink-muted")}>
                {t(`invoice:form.templates.${templateId}`)}
              </span>
            </button>
          );
        })}
      </div>

      <Dialog open={previewId !== null} onOpenChange={(open) => !open && setPreviewId(null)}>
        {previewId ? (
          <DialogContent title={t(`invoice:form.templates.${previewId}`)}>
            {/* Capped by height as well as width so the WHOLE page is
                always visible at once, and the buttons below never get
                pushed off-screen on a short phone. */}
            <div className="flex justify-center rounded-md border border-line bg-white p-1">
              <img
                src={TEMPLATE_LARGE_PREVIEWS[previewId]}
                alt={t(`invoice:form.templates.${previewId}`)}
                draggable={false}
                className="block h-auto max-h-[60vh] w-auto max-w-full"
              />
            </div>
            <div className="mt-4 flex gap-3">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setPreviewId(null)}>
                {t("actions.close")}
              </Button>
              {previewId === value ? (
                <Button type="button" className="flex-1" disabled>
                  <Check size={16} /> {t("invoice:form.currentDesign")}
                </Button>
              ) : (
                <Button
                  type="button"
                  className="flex-1"
                  onClick={() => {
                    const chosen = previewId;
                    // Close the enlarged view first, then hand the pick
                    // over — a caller's own confirmation dialog opens in
                    // its place, so two dialogs are never open at once.
                    setPreviewId(null);
                    onChange(chosen);
                  }}
                >
                  {t("invoice:form.useThisDesign")}
                </Button>
              )}
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </>
  );
}
