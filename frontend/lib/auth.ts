import type { User } from "../types";

const TOKEN_KEY = "appgen_token";
const USER_KEY = "appgen_user";
const AUTH_EVENT = "appgen-auth-changed";

const isBrowser = () => typeof window !== "undefined";

const notifyAuthChange = (): void => {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(AUTH_EVENT));
};

export const getToken = (): string | null => {
  if (!isBrowser()) return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const getUserRaw = (): string | null => {
  if (!isBrowser()) return null;
  return localStorage.getItem(USER_KEY);
};

export const setToken = (token: string): void => {
  if (!isBrowser()) return;
  localStorage.setItem(TOKEN_KEY, token);
  notifyAuthChange();
};

export const removeToken = (): void => {
  if (!isBrowser()) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  notifyAuthChange();
};

export const isLoggedIn = (): boolean => Boolean(getToken());

export const getUser = (): User | null => {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export const setUser = (user: User): void => {
  if (!isBrowser()) return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifyAuthChange();
};

export const subscribeAuth = (callback: () => void): (() => void) => {
  if (!isBrowser()) {
    return () => undefined;
  }

  const handleAuthChange = () => callback();

  window.addEventListener("storage", handleAuthChange);
  window.addEventListener(AUTH_EVENT, handleAuthChange);

  return () => {
    window.removeEventListener("storage", handleAuthChange);
    window.removeEventListener(AUTH_EVENT, handleAuthChange);
  };
};
