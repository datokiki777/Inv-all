import { clientRepository } from "@/storage/repositories";
import { generateId } from "@/utils/id";
import { nowIso } from "@/utils/date";
import type { Client } from "@/types";
import type { ClientFormValues } from "@/schemas";

/** Orchestration between the Client form/list and clientRepository. */
export const clientService = {
  async list(): Promise<Client[]> {
    return clientRepository.getAll();
  },

  async create(values: ClientFormValues): Promise<Client> {
    const now = nowIso();
    const client: Client = { ...values, id: generateId(), createdAt: now, updatedAt: now };
    await clientRepository.save(client);
    return client;
  },

  async update(existing: Client, values: ClientFormValues): Promise<Client> {
    const client: Client = { ...values, id: existing.id, createdAt: existing.createdAt, updatedAt: nowIso() };
    await clientRepository.save(client);
    return client;
  },

  async remove(id: string): Promise<void> {
    await clientRepository.remove(id);
  }
};
