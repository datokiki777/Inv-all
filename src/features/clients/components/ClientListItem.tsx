import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Client } from "@/types";
import { getClientDisplayName } from "@/utils/clientDisplayName";

interface ClientListItemProps {
  client: Client;
  onEdit: () => void;
  onDelete: () => void;
}

export function ClientListItem({ client, onEdit, onDelete }: ClientListItemProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-raised px-5 py-4">
      <button type="button" onClick={onEdit} className="flex-1 text-left">
        <p className="text-base font-medium text-ink">{getClientDisplayName(client)}</p>
        <p className="mt-1 text-sm text-ink-muted">
          {[client.city, client.country].filter(Boolean).join(", ") || client.email}
        </p>
      </button>
      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          onClick={onEdit}
          aria-label={t("actions.edit")}
          className="rounded p-2.5 text-ink-faint hover:bg-surface-sunken hover:text-ink"
        >
          <Pencil size={19} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={t("actions.delete")}
          className="rounded p-2.5 text-ink-faint hover:bg-surface-sunken hover:text-danger"
        >
          <Trash2 size={19} />
        </button>
      </div>
    </div>
  );
}
