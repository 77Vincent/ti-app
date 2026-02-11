"use client";

import { Button, Card, CardBody } from "@heroui/react";
import Link from "next/link";
import { getGoogleSignInPath } from "@/app/auth/signIn";

export default function SignInPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 items-center justify-center">
      <Card shadow="sm" className="w-full">
        <CardBody className="gap-4 p-8 text-center">
          <h1 className="text-2xl font-semibold">Sign in to Ti</h1>
          <Button as={Link} color="primary" href={getGoogleSignInPath("/test")} fullWidth>
            Continue with Google
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
