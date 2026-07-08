"use client";

import { Bell, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type StoredUser = {
  fullName?: string;
  email?: string;
  username?: string;
};

function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const token = window.localStorage.getItem("edurate_token");

  if (!token) {
    return null;
  }

  const rawUser = window.localStorage.getItem("edurate_user");

  if (!rawUser) {
    return { fullName: "EduRate User" };
  }

  try {
    return JSON.parse(rawUser) as StoredUser;
  } catch {
    return { fullName: "EduRate User" };
  }
}

function getInitials(user: StoredUser) {
  const source = user.fullName || user.username || user.email || "EduRate User";
  const parts = source
    .replace(/@.*/, "")
    .split(/\s|\.|_/)
    .filter(Boolean);

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function UserActions() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    function syncUser() {
      setUser(getStoredUser());
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

  const initials = useMemo(() => (user ? getInitials(user) : "ER"), [user]);

  if (!isReady || !user) {
    return (
      <div className="grid w-full shrink-0 grid-cols-2 gap-3 md:flex md:w-auto md:items-center md:gap-2">
        <Link
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-gray-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 md:hover:-translate-y-0.5 md:hover:shadow-md"
          href="/login"
        >
          <LogIn className="size-4" />
          Giriş
        </Link>
        <Link
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 text-sm font-medium text-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 md:hover:-translate-y-0.5 md:hover:shadow-md"
          href="/register"
        >
          <UserPlus className="size-4" />
          Qeydiyyat
        </Link>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-3">
      <button
        aria-label="Bildirişlər"
        className="flex size-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-gray-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 md:hover:-translate-y-0.5 md:hover:text-gray-900 md:hover:shadow-md"
        title="Bildirişlər"
        type="button"
      >
        <Bell className="size-4" />
      </button>
      <button
        aria-label="Profil"
        className="flex size-11 items-center justify-center rounded-2xl bg-gray-900 text-sm font-semibold text-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 md:hover:-translate-y-0.5 md:hover:shadow-md"
        title="Profil"
        type="button"
      >
        {initials}
      </button>
    </div>
  );
}
