import { API_PATHS } from "@/lib/config/paths";
import { parseHttpErrorMessage } from "@/lib/http/error";

export type UserSettings = {
  isSoundEnabled: boolean;
  isLargeQuestionTextEnabled: boolean;
};

type UserSettingsResponse = {
  settings?: unknown;
};

function parseUserSettingsResponse(payload: unknown): UserSettings | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const settings = (payload as UserSettingsResponse).settings;
  if (!settings || typeof settings !== "object") {
    return null;
  }

  const isSoundEnabled = (settings as { isSoundEnabled?: unknown }).isSoundEnabled;
  const isLargeQuestionTextEnabled = (
    settings as { isLargeQuestionTextEnabled?: unknown }
  ).isLargeQuestionTextEnabled;

  if (
    typeof isSoundEnabled !== "boolean" ||
    typeof isLargeQuestionTextEnabled !== "boolean"
  ) {
    return null;
  }

  return {
    isSoundEnabled,
    isLargeQuestionTextEnabled,
  };
}

export async function readUserSettings(): Promise<UserSettings> {
  const response = await fetch(API_PATHS.USER_SETTINGS, {
    cache: "no-store",
    method: "GET",
  });
  if (!response.ok) {
    throw new Error(await parseHttpErrorMessage(response));
  }

  const payload = (await response.json()) as unknown;
  const settings = parseUserSettingsResponse(payload);
  if (!settings) {
    throw new Error("Failed to load user settings.");
  }

  return settings;
}

export async function updateUserSettings(
  patch: Partial<UserSettings>,
): Promise<UserSettings> {
  const response = await fetch(API_PATHS.USER_SETTINGS, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(patch),
  });
  if (!response.ok) {
    throw new Error(await parseHttpErrorMessage(response));
  }

  const payload = (await response.json()) as unknown;
  const settings = parseUserSettingsResponse(payload);
  if (!settings) {
    throw new Error("Failed to update user settings.");
  }

  return settings;
}
