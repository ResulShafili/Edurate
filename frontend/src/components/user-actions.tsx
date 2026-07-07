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
      <div className="flex shrink-0 items-center gap-2">
        <Link
          className="flex h-10 items-center gap-2 rounded-lg border border-line bg-white/78 px-3 text-sm font-medium text-foreground shadow-[0_10px_28px_rgba(31,28,24,0.06)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-sage/50 hover:shadow-md"
          href="/login"
        >
          <LogIn className="size-4" />
          Giriş
        </Link>
        <Link
          className="flex h-10 items-center gap-2 rounded-lg bg-ink px-3 text-sm font-medium text-white shadow-[0_12px_26px_rgba(38,52,47,0.18)] transition hover:-translate-y-0.5 hover:bg-[#1f2b27] hover:shadow-md"
          href="/register"
        >
          <UserPlus className="size-4" />
          Qeydiyyat
        </Link>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        aria-label="Bildirişlər"
        className="flex size-10 items-center justify-center rounded-lg border border-line bg-white/78 text-muted shadow-[0_10px_28px_rgba(31,28,24,0.06)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-sage/50 hover:text-foreground hover:shadow-md"
        title="Bildirişlər"
        type="button"
      >
        <Bell className="size-4" />
      </button>
      <button
        aria-label="Profil"
        className="flex size-10 items-center justify-center rounded-lg bg-ink text-sm font-semibold text-white shadow-[0_12px_26px_rgba(38,52,47,0.18)] transition hover:-translate-y-0.5 hover:bg-[#1f2b27] hover:shadow-md"
        title="Profil"
        type="button"
      >
        {initials}
      </button>
    </div>
  );
}
