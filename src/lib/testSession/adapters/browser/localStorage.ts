const TEST_SESSION_LOCAL_STORAGE_KEY = "ti-app-test-session";

function getLocalStorage(): Storage | null {
  if (
    typeof window === "undefined" ||
    typeof window.localStorage === "undefined"
  ) {
    return null;
  }

  return window.localStorage;
}

function withLocalStorageRead(
  operation: (localStorage: Storage) => string | null,
): string | null {
  const localStorage = getLocalStorage();
  if (!localStorage) {
    return null;
  }

  try {
    return operation(localStorage);
  } catch {
    return null;
  }
}

function withLocalStorageWrite(
  operation: (localStorage: Storage) => void,
): void {
  const localStorage = getLocalStorage();
  if (!localStorage) {
    return;
  }

  try {
    operation(localStorage);
  } catch {
    // Ignore storage write failures.
  }
}

export function readLocalTestSessionRaw(): string | null {
  return withLocalStorageRead((localStorage) =>
    localStorage.getItem(TEST_SESSION_LOCAL_STORAGE_KEY),
  );
}

export function writeLocalTestSessionRaw(raw: string): void {
  withLocalStorageWrite((localStorage) => {
    localStorage.setItem(TEST_SESSION_LOCAL_STORAGE_KEY, raw);
  });
}

export function clearLocalTestSessionRaw(): void {
  withLocalStorageWrite((localStorage) => {
    localStorage.removeItem(TEST_SESSION_LOCAL_STORAGE_KEY);
  });
}
