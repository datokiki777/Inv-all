import { HashRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { InvoicesPage } from "@/features/invoices/pages/InvoicesPage";
import { CreateInvoicePage } from "@/features/invoices/pages/CreateInvoicePage";
import { EditInvoicePage } from "@/features/invoices/pages/EditInvoicePage";
import { InvoicePreviewPage } from "@/features/invoices/pages/InvoicePreviewPage";
import { ClientsPage } from "@/features/clients/pages/ClientsPage";
import { CompanyPage } from "@/features/company/pages/CompanyPage";
import { ProductsPage } from "@/features/products/pages/ProductsPage";
import { SettingsPage } from "@/features/settings/pages/SettingsPage";
import { BackupRestorePage } from "@/features/settings/pages/BackupRestorePage";

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
          <Route path="invoices/:invoiceId/preview" element={<InvoicePreviewPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="company" element={<CompanyPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="settings/backup" element={<BackupRestorePage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
