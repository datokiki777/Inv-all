import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import * as RadixToast from "@radix-ui/react-toast";
import { cn } from "@/utils/cn";

type ToastVariant = "success" | "error";

interface ToastItem {
  id: number;
  title: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  success: (title: string) => void;
  error: (title: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 1;

/** App-wide toast host. Mounted once in AppProviders. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((title: string, variant: ToastVariant) => {
    const id = nextId++;
    setItems((prev) => [...prev, { id, title, variant }]);
  }, []);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return (
    <ToastContext.Provider
      value={{
        success: (title) => push(title, "success"),
        error: (title) => push(title, "error")
      }}
    >
      <RadixToast.Provider swipeDirection="right" duration={3500}>
        {children}
        {items.map((item) => (
          <RadixToast.Root
            key={item.id}
            onOpenChange={(open) => !open && remove(item.id)}
            className={cn(
              "rounded-lg border px-4 py-3 text-sm shadow-lg data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-2",
              item.variant === "success" ? "border-success/40 bg-surface-raised text-ink" : "border-danger/40 bg-surface-raised text-ink"
            )}
          >
            <RadixToast.Title>{item.title}</RadixToast.Title>
          </RadixToast.Root>
        ))}
        <RadixToast.Viewport className="fixed inset-x-4 bottom-20 z-[60] flex flex-col gap-2 outline-none" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
