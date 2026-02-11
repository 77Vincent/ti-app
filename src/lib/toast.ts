"use client";

import { addToast, type ToastProps } from "@heroui/react";

type ToastKind = "error" | "warning" | "success" | "info";

type ToastOptions = {
  title?: string;
};

type ErrorToastOptions = ToastOptions & {
  fallbackDescription?: string;
};

const TOAST_DEFAULTS: Record<
  ToastKind,
  { color: ToastProps["color"]; title: string }
> = {
  error: {
    color: "danger",
    title: "Error",
  },
  warning: {
    color: "warning",
    title: "Warning",
  },
  success: {
    color: "success",
    title: "Success",
  },
  info: {
    color: "primary",
    title: "Info",
  },
};

function showToast(kind: ToastKind, description: string, options?: ToastOptions) {
  const config = TOAST_DEFAULTS[kind];

  addToast({
    color: config.color,
    description,
    title: options?.title ?? config.title,
    variant: "flat",
  });
}

function getErrorDescription(
  value: unknown,
  fallbackDescription: string,
): string {
  if (value instanceof Error && value.message.trim().length > 0) {
    return value.message;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }

  return fallbackDescription;
}

export const toast = {
  error(value: unknown, options?: ErrorToastOptions) {
    showToast(
      "error",
      getErrorDescription(
        value,
        options?.fallbackDescription ?? "Something went wrong.",
      ),
      options,
    );
  },
  warning(description: string, options?: ToastOptions) {
    showToast("warning", description, options);
  },
  success(description: string, options?: ToastOptions) {
    showToast("success", description, options);
  },
  info(description: string, options?: ToastOptions) {
    showToast("info", description, options);
  },
};
