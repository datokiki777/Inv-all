import { clientRepository } from "@/storage/repositories";
import { generateId } from "@/utils/id";
import { nowIso } from "@/utils/date";
import type { Client, ClientItemTemplateRow } from "@/types";
import type { ClientFormValues } from "@/schemas";

/** Orchestration between the Client form/list and clientRepository. */
export const clientService = {
  async list(): Promise<Client[]> {
    return clientRepository.getAll();
  },

  async getById(id: string): Promise<Client | undefined> {
    return clientRepository.getById(id);
  },

  async create(values: ClientFormValues): Promise<Client> {
    const now = nowIso();
    const client: Client = { ...values, id: generateId(), createdAt: now, updatedAt: now };
    await clientRepository.save(client);
    return client;
  },

  async update(existing: Client, values: ClientFormValues): Promise<Client> {
    // Spread `existing` first, `values` second — the Client form never
    // touches itemTemplate1/itemTemplate2 (ClientFormValues omits them), so
    // a plain `{...values, ...}` here would silently wipe out any saved
    // item templates every time the client's contact details are edited.
    const client: Client = { ...existing, ...values, id: existing.id, createdAt: existing.createdAt, updatedAt: nowIso() };
    await clientRepository.save(client);
    return client;
  },

  async remove(id: string): Promise<void> {
    await clientRepository.remove(id);
  },

  /** Saves the invoice form's current items as this client's reusable item template (slot 1 or 2), replacing whatever was there before. */
  async saveItemTemplate(clientId: string, slot: 1 | 2, items: ClientItemTemplateRow[]): Promise<Client> {
    const existing = await clientRepository.getById(clientId);
    if (!existing) throw new Error(`Client ${clientId} not found`);
    const client: Client = {
      ...existing,
      [slot === 1 ? "itemTemplate1" : "itemTemplate2"]: items,
      updatedAt: nowIso()
    };
    await clientRepository.save(client);
    return client;
  }
};
