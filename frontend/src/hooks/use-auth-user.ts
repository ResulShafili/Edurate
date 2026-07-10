"use client";

import { useEffect, useMemo, useState } from "react";

export type AuthUser = {
  fullName?: string;
  email?: string;
  username?: string;
  faculty?: string;
  courseYear?: number;
};

function readStoredUser(): AuthUser | null {
  const token = window.localStorage.getItem("edurate_token");

  if (!token) {
    return null;
  }

  const rawUser = window.localStorage.getItem("edurate_user");

  if (!rawUser) {
    return { fullName: "Tələbə" };
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return { fullName: "Tələbə" };
  }
}

export function getUserInitials(user: AuthUser) {
  const source = user.fullName || user.username || user.email || "Tələbə";
  const parts = source
    .replace(/@.*/, "")
    .split(/\s|\.|_/)
    .filter(Boolean);

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("az"))
    .join("");
}

export function clearStoredAuth() {
  window.localStorage.removeItem("edurate_token");
  window.localStorage.removeItem("edurate_user");
  window.dispatchEvent(new Event("edurate-auth-change"));
}

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    function syncUser() {
      setUser(readStoredUser());
      setIsReady(true);
    }

    syncUser();
    window.addEventListener("storage", syncUser);
    window.addEventListener("edurate-auth-change", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("edurate-auth-change", syncUser);
    };
  }, []);

  const initials = useMemo(() => (user ? getUserInitials(user) : "ER"), [user]);

  return { initials, isReady, user };
}
