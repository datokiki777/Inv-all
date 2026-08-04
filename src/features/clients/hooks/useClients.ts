import { useCallback, useEffect, useMemo, useState } from "react";
import { clientService } from "@/features/clients/services/clientService";
import { matchesClientQuery } from "@/utils/clientSearch";
import type { Client } from "@/types";
import type { ClientFormValues } from "@/schemas";

type Status = "loading" | "ready" | "error";

/** Loads all clients, exposes search + create/update/remove mutators. */
export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [query, setQuery] = useState("");

  const reload = useCallback(async () => {
    setStatus("loading");
    try {
      const list = await clientService.list();
      setClients(list);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const filtered = useMemo(() => clients.filter((client) => matchesClientQuery(client, query)), [clients, query]);

  const create = useCallback(async (values: ClientFormValues) => {
    const created = await clientService.create(values);
    setClients((prev) => [...prev, created]);
    return created;
  }, []);

  const update = useCallback(async (existing: Client, values: ClientFormValues) => {
    const updated = await clientService.update(existing, values);
    setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await clientService.remove(id);
    setClients((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { clients: filtered, allCount: clients.length, status, query, setQuery, create, update, remove, reload };
}
