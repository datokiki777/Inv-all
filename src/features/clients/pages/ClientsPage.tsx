import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/toast";
import { useClients } from "@/features/clients/hooks/useClients";
import { ClientForm } from "@/features/clients/components/ClientForm";
import { ClientListItem } from "@/features/clients/components/ClientListItem";
import { DeleteClientDialog } from "@/features/clients/components/DeleteClientDialog";
import type { Client } from "@/types";
import type { ClientFormValues } from "@/schemas";

export function ClientsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const { clients, allCount, status, query, setQuery, create, update, remove } = useClients();

  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>();
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  function openCreate() {
    setEditingClient(undefined);
    setFormOpen(true);
  }

  function openEdit(client: Client) {
    setEditingClient(client);
    setFormOpen(true);
  }

  async function handleSubmit(values: ClientFormValues) {
    try {
      if (editingClient) {
        await update(editingClient, values);
      } else {
        await create(values);
      }
      setFormOpen(false);
      toast.success(t("clients.saveSuccess"));
    } catch {
      toast.error(t("clients.saveError"));
    }
  }

  async function handleDelete() {
    if (!deletingClient) return;
    try {
      await remove(deletingClient.id);
      toast.success(t("clients.deleteSuccess"));
    } catch {
      toast.error(t("clients.deleteError"));
    } finally {
      setDeletingClient(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">{t("pages.clients")}</h1>
        <Button size="sm" onClick={openCreate}>
          <Plus size={16} /> {t("actions.add")}
        </Button>
      </div>

      {allCount > 0 ? (
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("clients.searchPlaceholder")}
            className="pl-9"
          />
        </div>
      ) : null}

      {status === "loading" ? <LoadingSpinner label={t("clients.loading")} /> : null}

      {status === "error" ? (
        <EmptyState title={t("clients.loadError")} description={t("clients.loadErrorHint")} />
      ) : null}

      {status === "ready" && allCount === 0 ? <EmptyState title={t("empty.clients")} /> : null}

      {status === "ready" && allCount > 0 && clients.length === 0 ? (
        <EmptyState title={t("clients.noSearchResults")} />
      ) : null}

      {status === "ready" && clients.length > 0 ? (
        <div className="space-y-2">
          {clients.map((client) => (
            <ClientListItem
              key={client.id}
              client={client}
              onEdit={() => openEdit(client)}
              onDelete={() => setDeletingClient(client)}
            />
          ))}
        </div>
      ) : null}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent title={editingClient ? t("clients.editTitle") : t("clients.addTitle")}>
          <ClientForm client={editingClient} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <DeleteClientDialog
        client={deletingClient}
        onOpenChange={(open) => !open && setDeletingClient(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
