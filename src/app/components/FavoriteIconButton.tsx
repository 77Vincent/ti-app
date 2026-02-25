"use client";

import { Button, type ButtonProps } from "@heroui/react";
import { Star } from "lucide-react";

type FavoriteIconButtonProps = {
  isFavorite: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  onPress: ButtonProps["onPress"];
  size?: ButtonProps["size"];
};

export default function FavoriteIconButton({
  isFavorite,
  isDisabled = false,
  isLoading = false,
  onPress,
  size = "sm",
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
      size={size}
      variant="light"
    >
      <Star
        aria-hidden
        className={isFavorite ? "fill-current" : undefined}
        size={19}
      />
    </Button>
  );
}
