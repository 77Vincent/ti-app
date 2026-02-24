"use client";

import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { LabeledValue } from "@/app/components";

type AccountProfile = {
  name: string;
  email: string;
};

export default function DashboardAccountPage() {
  const [profile, setProfile] = useState<AccountProfile>({
    name: "",
    email: "",
  });

  useEffect(() => {
    let active = true;

    void getSession().then((session) => {
      if (!active) {
        return;
      }

      setProfile({
        name: session?.user?.name?.trim() || "Unknown",
        email: session?.user?.email?.trim() || "Unknown",
      });
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <LabeledValue label="Name" value={profile.name} />
      <LabeledValue label="Email" value={profile.email} />
    </div>
  );
}
