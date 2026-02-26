import type { Metadata } from "next";
import { TestsPanel } from "@/app/components/testsPanel/TestsPanel";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function TestPage() {
  return (
    <section className="mx-auto">
      <TestsPanel />
    </section>
  );
}
