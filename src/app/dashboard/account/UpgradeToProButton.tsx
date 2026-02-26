"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { Infinity } from "lucide-react";
import { useState } from "react";
import { parseHttpErrorMessage } from "@/lib/http/error";
import { toast } from "@/lib/toast";

const CHECKOUT_PATH = "/api/stripe/checkout";

type CheckoutResponse = {
  url?: unknown;
};

export default function UpgradeToProButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

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
    <>
      <Button color="primary" onPress={onOpen}>
        Upgrade to Pro
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>Upgrade to Pro</ModalHeader>
          <ModalBody>
            <p className="inline-flex items-center gap-2">
              <Infinity aria-hidden="true" strokeWidth={2.5} size={20} />
              Unlimited attempts
            </p>
          </ModalBody>
          <ModalFooter className="w-full">
            <Button
              className="w-full"
              color="primary"
              isLoading={isLoading}
              onPress={handleUpgrade}
            >
              Continue
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
