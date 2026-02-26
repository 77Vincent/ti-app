"use client";

import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { USER_PLAN_REFRESH_EVENT } from "@/lib/events/userPlan";
import { readUserSettings } from "@/lib/settings/api";
import { useSettingsStore } from "@/lib/settings/store";
import { hasAuthenticatedUser } from "../../auth/sessionState";
import { readUserPlan, type UserPlan } from "./api";

type UseAppBarSessionResult = {
  isAuthenticated: boolean;
  plan: UserPlan | null;
  userDisplayName: string;
};

export function useAppBarSession(): UseAppBarSessionResult {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [userDisplayName, setUserDisplayName] = useState("");
  const applyUserSettings = useSettingsStore((state) => state.applyUserSettings);

  useEffect(() => {
    let active = true;

    void getSession().then((session) => {
      if (!active) {
        return;
      }

      const authenticated = hasAuthenticatedUser(session);
      setIsAuthenticated(authenticated);
      setUserDisplayName(session?.user?.name?.trim() || session?.user?.email?.trim() || "User");

      if (!authenticated) {
        setPlan(null);
        return;
      }

      void readUserSettings()
        .then((settings) => {
          if (active) {
            applyUserSettings(settings);
          }
        })
        .catch(() => undefined);

      void readUserPlan()
        .then((nextPlan) => {
          if (active) {
            setPlan(nextPlan);
          }
        })
        .catch(() => undefined);
    });

    return () => {
      active = false;
    };
  }, [applyUserSettings]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    function handlePlanRefresh() {
      void readUserPlan()
        .then((nextPlan) => {
          setPlan(nextPlan);
        })
        .catch(() => undefined);
    }

    window.addEventListener(USER_PLAN_REFRESH_EVENT, handlePlanRefresh);
    return () => {
      window.removeEventListener(USER_PLAN_REFRESH_EVENT, handlePlanRefresh);
    };
  }, [isAuthenticated]);

  return {
    isAuthenticated,
    plan,
    userDisplayName,
  };
}
