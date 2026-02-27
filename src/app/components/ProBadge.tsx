"use client";

import { Chip } from "@heroui/react";

export default function ProBadge() {
    return (
        <Chip color="warning" size="sm" variant="flat">
            <span className="font-semibold"> Pro </span>
        </Chip>
    );
}   