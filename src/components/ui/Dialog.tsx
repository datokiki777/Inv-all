import type { ReactNode } from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;

interface DialogContentProps {
  title: string;
  children: ReactNode;
  className?: string;
}

/**
 * Bottom-sheet style on mobile (slides up, rounded top, scrollable body)
 * rather than a centered desktop modal — more comfortable to reach and
 * dismiss with a thumb on Android.
 */
export function DialogContent({ title, children, className }: DialogContentProps) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=open]:fade-in" />
      <RadixDialog.Content
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-lg border-t border-line bg-surface-raised p-5 pb-8 safe-bottom",
          className
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <RadixDialog.Title className="font-display text-lg text-ink">{title}</RadixDialog.Title>
          <RadixDialog.Close className="rounded p-1.5 text-ink-faint hover:text-ink">
            <X size={18} />
          </RadixDialog.Close>
        </div>
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}
