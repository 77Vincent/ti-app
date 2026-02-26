"use client";

import { Button, Card, CardBody } from "@heroui/react";
import { signIn } from "next-auth/react";
import { GOOGLE_PROVIDER_ID } from "@/app/auth/signIn";
import { PAGE_PATHS } from "@/lib/config/paths";
import Image from "next/image";

export default function SignInPage() {
  const GOOGLE_LABEL = "Sign in with Google";

  return (
    <section className="flex justify-center">
      <Card shadow="sm" className="w-full max-w-md bg-content1/90 backdrop-blur">
        <CardBody className="gap-4 p-8 text-center">
          <h1 className="text-2xl font-semibold">Sign in to Ti</h1>
          <p className="font-light text-default-500">Learning through testing</p>
          <div className="flex justify-center">
            <Button
              aria-label={GOOGLE_LABEL}
              color="primary"
              isIconOnly
              onPress={() => {
                void signIn(GOOGLE_PROVIDER_ID, {
                  callbackUrl: PAGE_PATHS.DASHBOARD,
                });
              }}
              radius="full"
              size="lg"
              title={GOOGLE_LABEL}
              variant="bordered"
            >
              <Image
                alt=""
                aria-hidden
                height={18}
                src="/google-icon.svg"
                width={18}
              />
            </Button>
          </div>
        </CardBody>
      </Card>
    </section>
  );
}
