import { Outlet } from "react-router-dom";
import { MobileNav } from "@/app/layout/MobileNav";

/**
 * Shared shell for every routed page: scrollable content area plus a
 * fixed bottom nav sized for thumb reach on Android phones.
 */
export function AppLayout() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-surface">
      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-6">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
}
