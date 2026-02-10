"use client";

import { addToast } from "@heroui/react";

export function toastError(message: string): void {
  addToast({
    color: "danger",
    description: message,
    title: "Error",
    variant: "flat",
  });
}
