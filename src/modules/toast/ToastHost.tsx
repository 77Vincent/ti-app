"use client";

import { useEffect, useRef, useState } from "react";
import {
  subscribeToast,
  type ToastMessage,
  type ToastVariant,
} from "./toastBus";

const TOAST_DURATION_MS = 4000;

function getAlertClassName(variant: ToastVariant): string {
  switch (variant) {
    case "error":
      return "alert-error";
    case "success":
      return "alert-success";
    default:
      return "alert-info";
  }
}

export default function ToastHost() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timeoutIdsRef = useRef<number[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToast((nextToast) => {
      setToasts((prevToasts) => [...prevToasts, nextToast]);

      const timeoutId = window.setTimeout(() => {
        setToasts((prevToasts) =>
          prevToasts.filter((toast) => toast.id !== nextToast.id),
        );
      }, TOAST_DURATION_MS);

      timeoutIdsRef.current.push(timeoutId);
    });

    return () => {
      unsubscribe();
      timeoutIdsRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      timeoutIdsRef.current = [];
    };
  }, []);

  const visibleToasts = toasts.slice(-3);

  if (visibleToasts.length === 0) {
    return null;
  }

  return (
    <div className="toast toast-top toast-end z-50">
      {visibleToasts.map((toast) => (
        <div
          className={`alert ${getAlertClassName(toast.variant)}`}
          key={toast.id}
          role="alert"
        >
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
