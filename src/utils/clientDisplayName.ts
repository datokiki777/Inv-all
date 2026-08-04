import type { Client, ClientSnapshot } from "@/types";

/** Single place that turns a Client/ClientSnapshot into a printable name. */
export function getClientDisplayName(client: Pick<Client, "type" | "companyName" | "firstName" | "lastName"> | ClientSnapshot): string {
  if (client.type === "company") {
    return client.companyName?.trim() || "";
  }
  return [client.firstName, client.lastName].filter(Boolean).join(" ").trim();
}
