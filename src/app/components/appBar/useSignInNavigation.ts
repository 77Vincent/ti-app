"use client";

import { useCallback } from "react";
import { PAGE_PATHS } from "@/lib/config/paths";
import { clearTestSession } from "../../test/run/questionRunner/session/storage";

export function useSignInNavigation(): () => void {
  return useCallback(() => {
    void clearTestSession()
      .catch(() => undefined)
      .finally(() => {
        window.location.assign(PAGE_PATHS.SIGN_IN);
      });
  }, []);
}
