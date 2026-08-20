export const COOKIE_PREFERENCE_KEY = "prime-frango-cookie-preference";

export type CookiePreference = "accepted" | "necessary";

export type PreferenceStorage = Pick<Storage, "getItem" | "setItem">;

export function readCookiePreference(storage: PreferenceStorage): CookiePreference | null {
  const value = storage.getItem(COOKIE_PREFERENCE_KEY);
  return value === "accepted" || value === "necessary" ? value : null;
}

export function saveCookiePreference(storage: PreferenceStorage, preference: CookiePreference): CookiePreference {
  storage.setItem(COOKIE_PREFERENCE_KEY, preference);
  return preference;
}
