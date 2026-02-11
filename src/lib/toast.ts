"use client";

import { addToast, type ToastProps } from "@heroui/react";

type ToastOptions = {
  title?: string;
};

type ErrorToastOptions = ToastOptions & {
  fallbackDescription?: string;
};

function showToast(
  description: string,
  color: ToastProps["color"],
  defaultTitle: string,
  options?: ToastOptions,
) {
  addToast({
    color,
    description,
    title: options?.title ?? defaultTitle,
    variant: "flat",
  });
}

function getErrorDescription(value: unknown, fallbackDescription: string): string {
  if (value instanceof Error && value.message) {
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
      getErrorDescription(
        value,
        options?.fallbackDescription ?? "Something went wrong.",
      ),
      "danger",
      "Error",
      options,
    );
  },
  warning(description: string, options?: ToastOptions) {
    showToast(description, "warning", "Warning", options);
  },
  success(description: string, options?: ToastOptions) {
    showToast(description, "success", "Success", options);
  },
  info(description: string, options?: ToastOptions) {
    showToast(description, "primary", "Info", options);
  },
};
