"use client";

import { Button, Card, CardBody } from "@heroui/react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import {
  GOOGLE_PROVIDER_ID,
  POST_SIGN_IN_CALLBACK_PATH,
} from "@/app/auth/signIn";

export default function SignInPage() {
  function handleGoogleSignIn() {
    void signIn(GOOGLE_PROVIDER_ID, {
      callbackUrl: POST_SIGN_IN_CALLBACK_PATH,
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 items-center justify-center">
      <Card shadow="sm" className="w-full">
        <CardBody className="gap-4 p-8 text-center">
          <h1 className="text-2xl font-semibold">Sign in to Ti</h1>
          <Button color="primary" fullWidth onPress={handleGoogleSignIn}>
            Continue with Google
          </Button>
          <Button as={Link} href="/" fullWidth variant="light">
            Back to Home
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
