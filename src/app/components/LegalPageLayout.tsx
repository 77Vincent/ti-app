import type { ReactNode } from "react";

type LegalPageLayoutProps = {
  children: ReactNode;
};

export default function LegalPageLayout({
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-3xl space-y-4">
        {children}
      </section>
    </div>
  );
}
