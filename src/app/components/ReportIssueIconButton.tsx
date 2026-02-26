"use client";

import { Button, type ButtonProps } from "@heroui/react";
import { Flag } from "lucide-react";

type ReportIssueIconButtonProps = {
  isDisabled?: boolean;
  onPress: ButtonProps["onPress"];
};

export default function ReportIssueIconButton({
  isDisabled = false,
  onPress,
}: ReportIssueIconButtonProps) {
  return (
    <Button
      aria-label="Report question issue"
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
