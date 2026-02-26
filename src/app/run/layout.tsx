import type { Metadata } from "next";

type RunLayoutProps = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function RunLayout({ children }: RunLayoutProps) {
  return children;
}
