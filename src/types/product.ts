export type Unit = "hour" | "day" | "piece" | "kg" | "unit" | "flatRate";

export interface ProductOrService {
  id: string;
  name: string;
  description?: string;
  /** Standard unit price in the smallest currency unit (e.g. cents). */
  unitPriceCents: number;
  unit: Unit;
  defaultVatPercent: number;
  category?: string;
  createdAt: string;
  updatedAt: string;
}
