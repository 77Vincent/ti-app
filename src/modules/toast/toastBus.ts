export type ToastVariant = "error" | "success" | "info";

export type ToastMessage = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ToastListener = (toast: ToastMessage) => void;

const listeners = new Set<ToastListener>();
let nextToastId = 1;

export function subscribeToast(listener: ToastListener): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function pushToast(
  toast: Omit<ToastMessage, "id">,
): void {
  const message: ToastMessage = {
    ...toast,
    id: nextToastId++,
  };

  listeners.forEach((listener) => {
    listener(message);
  });
}

export function toastError(message: string): void {
  pushToast({ message, variant: "error" });
}
