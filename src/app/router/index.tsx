import { lazy, Suspense } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { InvoicesPage } from "@/features/invoices/pages/InvoicesPage";
import { CreateInvoicePage } from "@/features/invoices/pages/CreateInvoicePage";
import { EditInvoicePage } from "@/features/invoices/pages/EditInvoicePage";
import { ClientsPage } from "@/features/clients/pages/ClientsPage";
import { CompaniesPage } from "@/features/company/pages/CompaniesPage";
import { ProductsPage } from "@/features/products/pages/ProductsPage";
import { SettingsPage } from "@/features/settings/pages/SettingsPage";
import { BackupRestorePage } from "@/features/settings/pages/BackupRestorePage";

/**
 * The Preview page pulls in @react-pdf/renderer, which is large (fonts,
 * a PDF layout engine). It's lazy-loaded so that opening the Dashboard,
 * Invoices list, or any form doesn't pay for that download/parse cost —
 * only navigating to an actual PDF preview does.
 */
const InvoicePreviewPage = lazy(() =>
  import("@/features/invoices/pages/InvoicePreviewPage").then((m) => ({ default: m.InvoicePreviewPage }))
);

/**
 * HashRouter is used deliberately: the app is installed as a PWA and
 * opened via file:// / offline app-shell in some Android install flows,
 * where a history-based router requires server rewrite rules we don't have
 * (there is no server). Hash routing works everywhere with zero config.
 */
export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="invoices/new" element={<CreateInvoicePage />} />
          <Route path="invoices/:invoiceId/edit" element={<EditInvoicePage />} />
          <Route
            path="invoices/:invoiceId/preview"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <InvoicePreviewPage />
              </Suspense>
            }
          />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="company" element={<CompaniesPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="settings/backup" element={<BackupRestorePage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
