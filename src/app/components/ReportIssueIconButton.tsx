"use client";

import { Button, type ButtonProps } from "@heroui/react";
import { Flag } from "lucide-react";

type ReportIssueIconButtonProps = {
  isDisabled?: boolean;
  onPress: ButtonProps["onPress"];
};

const BUTTON_LABEL = "Report an issue with this question";

export default function ReportIssueIconButton({
  isDisabled = false,
  onPress,
}: ReportIssueIconButtonProps) {
  return (
    <Button
      aria-label={BUTTON_LABEL}
      title={BUTTON_LABEL}
      isIconOnly
      isDisabled={isDisabled}
      onPress={onPress}
      radius="full"
      size="sm"
      variant="light"
    >
      <Flag aria-hidden size={19} strokeWidth={2.5}/>
    </Button>
  );
}
