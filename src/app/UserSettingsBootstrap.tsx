"use client";

import { getSession } from "next-auth/react";
import { useEffect } from "react";
import { readUserSettings } from "@/lib/settings/api";
import { useSettingsStore } from "@/lib/settings/store";
import { hasAuthenticatedUser } from "./auth/sessionState";

export default function UserSettingsBootstrap() {
  const applyUserSettings = useSettingsStore((state) => state.applyUserSettings);

  useEffect(() => {
    let active = true;

    void getSession().then((session) => {
      if (!active || !hasAuthenticatedUser(session)) {
        return;
      }

      void readUserSettings()
        .then((settings) => {
          if (active) {
            applyUserSettings(settings);
          }
        })
        .catch(() => undefined);
    });

    return () => {
      active = false;
    };
  }, [applyUserSettings]);

  return null;
}
