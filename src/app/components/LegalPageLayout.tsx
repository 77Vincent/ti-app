import type { ReactNode } from "react";
import MobileBackButton from "./MobileBackButton";

type LegalPageLayoutProps = {
  children: ReactNode;
};

export default function LegalPageLayout({
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="flex flex-1 flex-col space-y-2">
      <div className="mx-auto w-full max-w-3xl sm:hidden">
        <MobileBackButton ariaLabel="Go back" />
      </div>
      <section className="mx-auto w-full max-w-3xl space-y-4">
        {children}
      </section>
    </div>
  );
}
