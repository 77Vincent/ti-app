"use client";

import { addToast, type ToastProps } from "@heroui/react";

type ErrorToastOptions = {
  fallbackDescription?: string;
};

function showToast(
  description: string,
  color: ToastProps["color"],
) {
  addToast({
    color,
    description,
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
    );
  },
  warning(description: string) {
    showToast(description, "warning");
  },
  success(description: string) {
    showToast(description, "success");
  },
  info(description: string) {
    showToast(description, "primary");
  },
};
