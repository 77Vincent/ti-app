"use client";

import { ToastProvider } from "@heroui/react";

export default function ToastHost() {
  return <ToastProvider maxVisibleToasts={3} placement="top-center" toastOffset={16} />;
}
