import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { readAuthenticatedUserId } from "@/app/api/test/session/auth";
import { StatsCards } from "@/app/components";
import {
  BRAND_DESCRIPTION,
  BRAND_TAGLINE,
  BRAND_TITLE,
  HOME_DESCRIPTION,
} from "@/lib/config/brand";
import { PAGE_PATHS } from "@/lib/config/paths";
import { readSiteUrl } from "@/lib/config/siteUrl";
import { buildStatsCardItems } from "@/lib/stats/cards";
import { readGlobalSummaryStats } from "@/lib/stats/data";
import HomeStartButton from "./components/HomeStartButton";

const SITE_NAME = BRAND_TITLE;
const HOME_TITLE = `${BRAND_TITLE} | ${BRAND_TAGLINE}`;
const HOME_CANONICAL_PATH = "/";

const SITE_URL = readSiteUrl();
const HOME_URL = `${SITE_URL}${HOME_CANONICAL_PATH}`;
const HOME_OG_IMAGE_URL = `${SITE_URL}/opengraph-image`;

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: BRAND_DESCRIPTION,
  alternates: {
    canonical: HOME_URL,
  },
  openGraph: {
    title: HOME_TITLE,
    description: BRAND_DESCRIPTION,
    url: HOME_URL,
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: HOME_OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: HOME_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: BRAND_DESCRIPTION,
    images: [HOME_OG_IMAGE_URL],
  },
};

export default async function Home() {
  const userId = await readAuthenticatedUserId();
  if (userId) {
    redirect(PAGE_PATHS.DASHBOARD);
  }

  const stats = await readGlobalSummaryStats();
  const statItems = buildStatsCardItems(stats);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    description: BRAND_DESCRIPTION,
    url: HOME_URL,
  };

  return (
    <div className="flex flex-1 flex-col">
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
        type="application/ld+json"
      />
      <div className="mx-auto flex flex-col w-full max-w-6xl flex-1 items-center justify-between py-4 sm:py-8 px-2">
          <section className="mt-6 sm:mt-10 space-y-6 text-center">
            <div className="space-y-4">
              <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
                Learning through <span className="text-primary">Testing</span>
              </h1>
              <p className="text-xl sm:text-2xl lg:text-3xl font-light text-default-500">
                {HOME_DESCRIPTION}
              </p>
            </div>

            <HomeStartButton href={PAGE_PATHS.TEST} />
          </section>

          <section className="w-full space-y-4">
            <StatsCards items={statItems} />
          </section>
      </div>
    </div>
  );
}
