"use client";

import { Card, CardBody } from "@heroui/react";
import { useEffect, useRef, useState } from "react";
import {
  subscribeToast,
  type ToastMessage,
  type ToastVariant,
} from "./toastBus";

const TOAST_DURATION_MS = 4000;

function getToastClassName(variant: ToastVariant): string {
  switch (variant) {
    case "error":
      return "border-danger-300 bg-danger-50 text-danger-700";
    case "success":
      return "border-success-300 bg-success-50 text-success-700";
    default:
      return "border-primary-300 bg-primary-50 text-primary-700";
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
    <div className="fixed top-4 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 flex-col gap-2 px-4">
      {visibleToasts.map((toast) => (
        <Card
          className={`border-medium ${getToastClassName(toast.variant)}`}
          key={toast.id}
          role="alert"
        >
          <CardBody className="px-4 py-3 text-sm">
            {toast.message}
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
