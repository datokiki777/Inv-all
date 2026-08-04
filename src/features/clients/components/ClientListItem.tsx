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
    <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-raised px-4 py-3.5">
      <button type="button" onClick={onEdit} className="flex-1 text-left">
        <p className="text-sm font-medium text-ink">{getClientDisplayName(client)}</p>
        <p className="mt-0.5 text-xs text-ink-muted">
          {[client.city, client.country].filter(Boolean).join(", ") || client.email}
        </p>
      </button>
      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          onClick={onEdit}
          aria-label={t("actions.edit")}
          className="rounded p-2 text-ink-faint hover:bg-surface-sunken hover:text-ink"
        >
          <Pencil size={17} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={t("actions.delete")}
          className="rounded p-2 text-ink-faint hover:bg-surface-sunken hover:text-danger"
        >
          <Trash2 size={17} />
        </button>
      </div>
    </div>
  );
}
