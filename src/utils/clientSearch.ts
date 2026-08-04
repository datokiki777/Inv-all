import type { Client } from "@/types";
import { getClientDisplayName } from "./clientDisplayName";

/** Pure predicate so the matching rule can be unit-tested independently of the React hook that uses it. */
export function matchesClientQuery(client: Client, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [getClientDisplayName(client), client.email, client.city, client.vatId]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}
