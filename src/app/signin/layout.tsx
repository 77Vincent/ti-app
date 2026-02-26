import type { Metadata } from "next";

type SignInLayoutProps = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignInLayout({ children }: SignInLayoutProps) {
  return children;
}
