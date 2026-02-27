"use client";

import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { USER_PLAN_REFRESH_EVENT } from "@/lib/events/userPlan";
import { readUserPlan, type UserPlan } from "@/lib/plan/api";
import { hasAuthenticatedUser } from "../../auth/sessionState";

type UseAppBarSessionResult = {
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  plan: UserPlan | null;
  userDisplayName: string;
};

export function useAppBarSession(): UseAppBarSessionResult {
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [userDisplayName, setUserDisplayName] = useState("");

  useEffect(() => {
    let active = true;

    void getSession()
      .then((session) => {
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

        void readUserPlan()
          .then((nextPlan) => {
            if (active) {
              setPlan(nextPlan);
            }
          })
          .catch(() => undefined);
      })
      .finally(() => {
        if (active) {
          setIsAuthLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

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
    isAuthLoading,
    isAuthenticated,
    plan,
    userDisplayName,
  };
}
