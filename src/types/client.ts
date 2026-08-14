import type { Unit } from "./product";

export type ClientType = "company" | "individual";

/**
 * One line-item's worth of reusable data, saved from an Invoice's Items
 * section onto a Client (see ClientItemTemplatePicker) — deliberately just
 * the item fields (name, description, quantity, unit, price). No
 * discount/VAT: those are invoice-level settings now, not per-item, so
 * they'd have nothing meaningful to store here.
 */
export interface ClientItemTemplateRow {
  name: string;
  description?: string;
  quantity: number;
  unit: Unit;
  unitPrice: number;
}

/**
 * Flat shape (not a discriminated union) on purpose: which fields are
 * *required* depends on `type`, but the shape itself doesn't change, so
 * the entity, the Zod schema, and the React Hook Form values can all share
 * one simple interface instead of three union variants.
 */
export interface Client {
  id: string;
  type: ClientType;
  /** Required when type === "company". */
  companyName?: string;
  /** Required when type === "individual". */
  firstName?: string;
  lastName?: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode: string;
  city: string;
  country: string;
  email?: string;
  phone?: string;
  vatId?: string;
  taxNumber?: string;
  notes?: string;
  /**
   * Two reusable line-item sets for this client — saved directly from the
   * Invoice form's Items section (never edited on the Client form itself).
   * Picking one on a later invoice replaces the current items with these.
   */
  itemTemplate1?: ClientItemTemplateRow[];
  itemTemplate2?: ClientItemTemplateRow[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Frozen copy of a Client embedded into an Invoice at creation time, so
 * editing/deleting the live Client record never mutates a past invoice.
 */
export type ClientSnapshot = Omit<Client, "createdAt" | "updatedAt" | "notes">;
