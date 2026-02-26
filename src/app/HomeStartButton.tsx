"use client";

import { Button } from "@heroui/react";
import Link from "next/link";

type Props = {
  href: string;
};

export default function HomeStartButton({ href }: Props) {
  return (
    <Button as={Link} color="primary" href={href} radius="full" size="lg">
      Start
    </Button>
  );
}
