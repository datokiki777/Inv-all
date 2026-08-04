import { useRegisterSW } from "virtual:pwa-register/react";
import { Button } from "@/components/ui/Button";

/**
 * Surfaces an explicit "Update available" banner instead of silently
 * activating a new service worker. The user decides when to reload —
 * never mid-invoice.
 */
export function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // Poll periodically so a long-lived open tab still notices updates.
      if (registration) {
        setInterval(() => registration.update(), 60 * 60 * 1000);
      }
    }
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-raised px-4 py-3 shadow-lg safe-bottom">
      <p className="text-sm text-ink">A new version is ready.</p>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => setNeedRefresh(false)}>
          Later
        </Button>
        <Button size="sm" onClick={() => updateServiceWorker(true)}>
          Update
        </Button>
      </div>
    </div>
  );
}
