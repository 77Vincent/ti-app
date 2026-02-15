"use client";

import { Button, Card, CardBody } from "@heroui/react";
import { signIn } from "next-auth/react";
import { GOOGLE_PROVIDER_ID } from "@/app/auth/signIn";
import { PAGE_PATHS } from "@/lib/config/paths";
import Image from "next/image";
import HeroBanner from "@/app/components/heroBanner/HeroBanner";

export default function SignInPage() {
  return (
    <div className="relative">
      <div aria-hidden className="blur-sm pointer-events-none absolute inset-x-0 top-0 z-0">
        <HeroBanner />
      </div>

      <section className="relative z-10 flex justify-center">
        <Card shadow="sm" className="w-full max-w-md bg-content1/90 backdrop-blur">
          <CardBody className="gap-4 p-8 text-center">
            <h1 className="text-2xl font-semibold">Sign in to Ti</h1>
            <p className="font-light text-default-500">Learning through testing</p>
            <Button
              color="primary"
              fullWidth
              startContent={
                <Image
                  alt=""
                  aria-hidden
                  height={18}
                  src="/google-icon.svg"
                  width={18}
                />
              }
              onPress={() => {
                void signIn(GOOGLE_PROVIDER_ID, {
                  callbackUrl: PAGE_PATHS.TEST,
                });
              }}
              variant="bordered"
            >
              Continue with Google
            </Button>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
