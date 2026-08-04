import { useEffect, useState } from "react";
import { invoiceService } from "@/features/invoices/services/invoiceService";
import { computeDashboardMetrics, type DashboardMetrics } from "@/utils/dashboardMetrics";
import { todayDateOnly } from "@/utils/date";

type Status = "loading" | "ready" | "error";

export function useDashboardData() {
  const [metrics, setMetrics] = useState<DashboardMetrics | undefined>();
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;
    invoiceService
      .list()
      .then((invoices) => {
        if (cancelled) return;
        setMetrics(computeDashboardMetrics(invoices, todayDateOnly()));
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  return { metrics, status };
}
