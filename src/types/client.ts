export type ClientType = "company" | "individual";

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
  createdAt: string;
  updatedAt: string;
}

/**
 * Frozen copy of a Client embedded into an Invoice at creation time, so
 * editing/deleting the live Client record never mutates a past invoice.
 */
export type ClientSnapshot = Omit<Client, "createdAt" | "updatedAt" | "notes">;
