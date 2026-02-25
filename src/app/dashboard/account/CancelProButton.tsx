"use client";

import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { parseHttpErrorMessage } from "@/lib/http/error";
import { toast } from "@/lib/toast";

const CANCEL_PATH = "/api/stripe/cancel";

type CancelProButtonProps = {
  isCancellationScheduled: boolean;
};

export default function CancelProButton({
  isCancellationScheduled,
}: CancelProButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleCancel(): Promise<void> {
    if (isLoading || isCancellationScheduled) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(CANCEL_PATH, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(
          await parseHttpErrorMessage(
            response,
            "Failed to cancel Pro subscription.",
          ),
        );
      }

      toast.success(
        "Cancellation confirmed. Your Pro plan will end at the end of this billing period.",
      );
      router.refresh();
    } catch (error) {
      toast.error(error, {
        fallbackDescription: "Failed to cancel Pro subscription.",
      });
      setIsLoading(false);
    }
  }

  return (
    <Button
      color="default"
      isDisabled={isCancellationScheduled}
      isLoading={isLoading}
      onPress={handleCancel}
      variant="flat"
    >
      {isCancellationScheduled ? "Ends at Period End" : "Cancel Pro"}
    </Button>
  );
}
