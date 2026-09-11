import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { Button } from "@/components/ui/Button";

const CHECK_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes — was 1 hour, too infrequent to notice a fresh deploy promptly

/**
 * Surfaces an explicit "Update available" banner instead of silently
 * activating a new service worker. The user decides when to reload —
 * never mid-invoice.
 *
 * `setInterval` alone is unreliable here: mobile browsers heavily throttle
 * timers in backgrounded/suspended tabs, which an installed PWA sits in
 * almost all the time — so the previous hourly-only check could go a long
 * while without ever actually firing. This also checks immediately on
 * mount and every time the app comes back to the foreground
 * (visibilitychange), which is when a person is most likely to actually
 * notice and act on the prompt anyway.
 */
export function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return;

      registration.update();

      const interval = setInterval(() => registration.update(), CHECK_INTERVAL_MS);

      const onVisible = () => {
        if (document.visibilityState === "visible") registration.update();
      };
      document.addEventListener("visibilitychange", onVisible);

      return () => {
        clearInterval(interval);
        document.removeEventListener("visibilitychange", onVisible);
      };
    }
  });

  // useRegisterSW's onRegisteredSW doesn't run its own cleanup — mirror the
  // same "check when foregrounded" behavior at the component level so it
  // still applies even before the callback above ever sets up its own
  // listener (e.g. the very first time the app is opened).
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") {
        navigator.serviceWorker?.getRegistration().then((reg) => reg?.update());
      }
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

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
