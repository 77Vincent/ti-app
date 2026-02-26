"use client";

import { Button, type ButtonProps } from "@heroui/react";
import { Star } from "lucide-react";

type FavoriteIconButtonProps = {
  isFavorite: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  onPress: ButtonProps["onPress"];
};

export default function FavoriteIconButton({
  isFavorite,
  isDisabled = false,
  isLoading = false,
  onPress,
}: FavoriteIconButtonProps) {
  return (
    <Button
      aria-label={isFavorite ? "Remove favorite question" : "Favorite question"}
      color={isFavorite ? "warning" : "default"}
      isIconOnly
      isDisabled={isDisabled}
      isLoading={isLoading}
      onPress={onPress}
      radius="full"
      size="sm"
      variant="light"
    >
      <Star
        aria-hidden
        className={isFavorite ? "fill-current" : undefined}
        size={19}
        strokeWidth={2.5}
      />
    </Button>
  );
}
