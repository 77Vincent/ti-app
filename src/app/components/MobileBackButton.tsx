"use client";

import { Button } from "@heroui/react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type MobileBackButtonProps = {
  ariaLabel?: string;
};

export default function MobileBackButton({
  ariaLabel = "Go back",
}: MobileBackButtonProps) {
  const router = useRouter();

  return (
    <Button
      size="sm"
      isIconOnly
      aria-label={ariaLabel}
      onPress={() => router.back()}
      startContent={<ChevronLeft aria-hidden size={24} />}
      variant="light"
    />
  );
}
