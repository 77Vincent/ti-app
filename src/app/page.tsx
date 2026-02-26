import type { Metadata } from "next";
import { readAuthenticatedUserId } from "@/app/api/test/session/auth";
import { Footer } from "@/app/components";
import { PAGE_PATHS } from "@/lib/config/paths";
import HomeStartButton from "./components/HomeStartButton";

const HOME_TITLE = "It | Learning Through Testing";
const HOME_DESCRIPTION = "Infinite high-quality questions for adaptive learning.";
const HOME_CANONICAL_PATH = "/";

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: {
    canonical: HOME_CANONICAL_PATH,
  },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: HOME_CANONICAL_PATH,
    siteName: "It",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
};

export default async function Home() {
  const userId = await readAuthenticatedUserId();
  const startHref = userId ? PAGE_PATHS.DASHBOARD : PAGE_PATHS.TEST;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 items-center justify-center">
        <section className="mx-auto max-w-5xl space-y-6 sm:space-y-8 px-4 text-center">
          <div className="space-y-3">
            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Learning through <span className="text-primary-500">testing</span>
            </h1>
            <p className="text-xl sm:text-2xl lg:text-3xl font-light text-default-500">
              {HOME_DESCRIPTION}
            </p>
          </div>

          <HomeStartButton href={startHref} />
        </section>
      </div>
      <Footer />
    </div>
  );
}
