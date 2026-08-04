import type { ReactNode } from "react";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { PWAUpdatePrompt } from "@/app/providers/PWAUpdatePrompt";
import { ToastProvider } from "@/components/ui/toast";

/**
 * Composition root for cross-cutting concerns (error handling, toasts, PWA
 * update banner). i18n is initialized as a side effect in main.tsx rather
 * than here, since it must run before first render.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        {children}
        <PWAUpdatePrompt />
      </ToastProvider>
    </ErrorBoundary>
  );
}
