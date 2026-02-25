"use client";

import { Button } from "@heroui/react";
import { useState } from "react";
import { parseHttpErrorMessage } from "@/lib/http/error";
import { toast } from "@/lib/toast";

const CHECKOUT_PATH = "/api/stripe/checkout";

type CheckoutResponse = {
  url?: unknown;
};

export default function UpgradeToProButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleUpgrade(): Promise<void> {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(CHECKOUT_PATH, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(
          await parseHttpErrorMessage(
            response,
            "Failed to start Pro checkout.",
          ),
        );
      }

      const payload = (await response.json()) as CheckoutResponse;
      if (typeof payload.url !== "string" || payload.url.trim().length === 0) {
        throw new Error("Checkout URL is unavailable.");
      }

      window.location.assign(payload.url);
    } catch (error) {
      toast.error(error, {
        fallbackDescription: "Failed to start Pro checkout.",
      });
      setIsLoading(false);
    }
  }

  return (
    <Button color="primary" isLoading={isLoading} onPress={handleUpgrade}>
      Upgrade to Pro
    </Button>
  );
}
