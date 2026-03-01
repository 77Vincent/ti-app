"use client";

import { Button, type ButtonProps } from "@heroui/react";
import { Star } from "lucide-react";

type FavoriteIconButtonProps = {
  isFavorite: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  onPress: ButtonProps["onPress"];
  size?: "sm" | "md"
};

export default function FavoriteIconButton({
  isFavorite,
  isDisabled = false,
  isLoading = false,
  onPress,
  size = "md",
}: FavoriteIconButtonProps) {
  return (
    <Button
      aria-label={isFavorite ? "Remove favorite question" : "Favorite question"}
      color={isFavorite ? "warning" : "default"}
      isIconOnly
      isDisabled={isDisabled}
      isLoading={isLoading}
      size={size}
      onPress={onPress}
      radius="full"
      variant="light"
      title={isFavorite ? "Remove favorite question" : "Favorite question"}
    >
      <Star
        aria-hidden
        className={isFavorite ? "fill-current" : undefined}
        size={size === "sm" ? 20 : 24}
      />
    </Button>
  );
}
