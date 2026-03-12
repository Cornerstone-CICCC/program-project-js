import React, { createContext, useContext, useMemo, useState } from "react";

type ToastVariant = "default" | "destructive";

type ToastItem = {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastInput = Omit<ToastItem, "id">;

type ToastContextType = {
  toast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

type ToastProviderProps = {
  children: React.ReactNode;
};

export function ToastProvider({
  children,
}: ToastProviderProps): React.JSX.Element {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = ({ title, description, variant = "default" }: ToastInput) => {
    const id = crypto.randomUUID();

    setToasts((prev) => [...prev, { id, title, description, variant }]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3000);
  };

  const value = useMemo(() => ({ toast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="fixed top-6 right-6 z-50 space-y-2">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`min-w-[280px] rounded-xl border px-4 py-3 shadow-lg ${
              item.variant === "destructive"
                ? "border-red-200 bg-red-50"
                : "border-border bg-white"
            }`}
          >
            {item.title && (
              <div
                className={`font-semibold ${
                  item.variant === "destructive"
                    ? "text-red-600"
                    : "text-foreground"
                }`}
              >
                {item.title}
              </div>
            )}

            {item.description && (
              <div
                className={`mt-1 text-sm ${
                  item.variant === "destructive"
                    ? "text-red-500"
                    : "text-muted-foreground"
                }`}
              >
                {item.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}