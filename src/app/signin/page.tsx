"use client";

import { Button, Card, CardBody } from "@heroui/react";
import { signIn } from "next-auth/react";
import { GOOGLE_PROVIDER_ID, MICROSOFT_PROVIDER_ID } from "@/app/auth/signIn";
import { Footer } from "@/app/components";
import { BRAND_TAGLINE, BRAND_TITLE } from "@/lib/config/brand";
import { PAGE_PATHS } from "@/lib/config/paths";
import Image from "next/image";

export default function SignInPage() {
  const providers = [
    {
      id: GOOGLE_PROVIDER_ID,
      label: "Sign in with Google",
      iconSrc: "/google-icon.svg",
    },
    {
      id: MICROSOFT_PROVIDER_ID,
      label: "Sign in with Microsoft",
      iconSrc: "/microsoft-icon.svg",
    },
  ] as const;

  return (
    <div className="flex flex-1 flex-col space-y-2">
      <section className="flex justify-center">
        <Card shadow="sm" className="w-full max-w-md bg-content1/90 backdrop-blur">
          <CardBody className="gap-4 p-8 text-center">
            <h1 className="text-2xl font-semibold">Sign in to {BRAND_TITLE}</h1>
            <p className="font-light text-default-500">{BRAND_TAGLINE}</p>
            <div className="flex justify-center gap-4">
              {providers.map((provider) => (
                <Button
                  key={provider.id}
                  aria-label={provider.label}
                  color="primary"
                  isIconOnly
                  onPress={() => {
                    void signIn(provider.id, {
                      callbackUrl: PAGE_PATHS.DASHBOARD,
                    });
                  }}
                  radius="full"
                  size="lg"
                  title={provider.label}
                  variant="bordered"
                >
                  <Image
                    alt=""
                    aria-hidden
                    height={18}
                    src={provider.iconSrc}
                    width={18}
                  />
                </Button>
              ))}
            </div>
          </CardBody>
        </Card>
      </section>
      <Footer />
    </div>
  );
}
