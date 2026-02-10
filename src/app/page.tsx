"use client";

import { Button, Card, CardBody } from "@heroui/react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <CardBody className="items-center gap-4 p-8 text-center">
          <h1 className="text-4xl font-medium">Learning by testing</h1>
          <Button as={Link} color="primary" href="/test">
            Test Now
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
