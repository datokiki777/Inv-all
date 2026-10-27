import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Company, Client, Invoice, ProductOrService, AppSettings } from "@/types";

/**
 * Single source of truth for the IndexedDB schema and its version history.
 * Every schema change bumps DB_VERSION and adds an `if (oldVersion < N)`
 * migration block below — existing data is never dropped on upgrade.
 */
export const DB_NAME = "invoice-app-db";
export const DB_VERSION = 3;

export const STORE = {
  companies: "companies",
  clients: "clients",
  invoices: "invoices",
  products: "products",
  settings: "settings",
  invoiceDrafts: "invoiceDrafts",
  recentExports: "recentExports"
} as const;

/** A saved-but-not-submitted Invoice form, keyed by "new" (create page) or the invoice id (edit page). */
export interface InvoiceDraftRecord {
  key: string;
  /** Serialized InvoiceFormValues — stored as unknown here to avoid a schemas -> storage dependency. */
  values: unknown;
  savedAt: string;
}

/**
 * Tracks when an invoice's PDF was last downloaded or shared — for the
 * Dashboard's "Recently exported" shortcut list. Keyed by invoiceId
 * itself (not a generated id), so re-exporting the same invoice just
 * bumps its existing record's timestamp rather than piling up duplicate
 * entries. No PDF bytes are stored here at all — just this pointer +
 * timestamp; the PDF itself is always regenerated fresh from the
 * invoice's current data when opened, so it's never stale.
 */
export interface RecentExportRecord {
  invoiceId: string;
  exportedAt: string;
}

interface InvoiceAppDB extends DBSchema {
  companies: { key: string; value: Company };
  // No "by-name" index here: Client has no single `name` field (company vs.
  // individual clients use different fields), so listing/sorting is done
  // in-memory in clientRepository using getClientDisplayName().
  clients: { key: string; value: Client };
  invoices: {
    key: string;
    value: Invoice;
    indexes: { "by-status": string; "by-createdDate": string; "by-clientId": string };
  };
  products: { key: string; value: ProductOrService; indexes: { "by-name": string } };
  settings: { key: string; value: AppSettings };
  invoiceDrafts: { key: string; value: InvoiceDraftRecord };
  recentExports: { key: string; value: RecentExportRecord; indexes: { "by-exportedAt": string } };
}

let dbPromise: Promise<IDBPDatabase<InvoiceAppDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<InvoiceAppDB>> {
  if (!dbPromise) {
    dbPromise = openDB<InvoiceAppDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore(STORE.companies, { keyPath: "id" });

          db.createObjectStore(STORE.clients, { keyPath: "id" });

          const invoices = db.createObjectStore(STORE.invoices, { keyPath: "id" });
          invoices.createIndex("by-status", "status");
          invoices.createIndex("by-createdDate", "createdDate");
          invoices.createIndex("by-clientId", "client.id");

          const products = db.createObjectStore(STORE.products, { keyPath: "id" });
          products.createIndex("by-name", "name");

          db.createObjectStore(STORE.settings, { keyPath: "id" });
        }

        if (oldVersion < 2) {
          // Autosave scratch space for in-progress Invoice forms (see
          // invoiceDraftRepository). Existing stores/data are untouched.
          db.createObjectStore(STORE.invoiceDrafts, { keyPath: "key" });
        }

        if (oldVersion < 3) {
          // See RecentExportRecord — keyed by invoiceId itself so an
          // export just upserts in place.
          const recentExports = db.createObjectStore(STORE.recentExports, { keyPath: "invoiceId" });
          recentExports.createIndex("by-exportedAt", "exportedAt");
        }

        // Next migration goes here, e.g.:
        // if (oldVersion < 4) { ... add a new index / store without touching existing data ... }
      }
    });
  }
  return dbPromise;
}
