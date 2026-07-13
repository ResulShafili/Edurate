"use client";

import { LogIn, UserPlus } from "lucide-react";
import Link from "next/link";

import { useAuthUser } from "@/hooks/use-auth-user";

export function UserActions() {
  const { initials, isReady, user } = useAuthUser();

  if (!isReady || !user) {
    return (
      <div className="flex shrink-0 items-center gap-2">
        <Link
          aria-label="Giriş"
          className="app-button-secondary flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-2xl px-3 text-sm font-medium transition-all duration-200 active:scale-[0.98] md:hover:-translate-y-0.5 lg:px-4"
          href="/login"
        >
          <LogIn className="size-4" />
          <span className="hidden lg:inline">Giriş</span>
        </Link>
        <Link
          aria-label="Qeydiyyat"
          className="app-button-primary flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-2xl px-3 text-sm font-medium transition-all duration-200 active:scale-[0.98] md:hover:-translate-y-0.5 lg:px-4"
          href="/register"
        >
          <UserPlus className="size-4" />
          <span className="hidden lg:inline">Qeydiyyat</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center">
      <Link
        aria-label="Profil"
        className="flex size-11 items-center justify-center rounded-2xl bg-[#17362f] text-sm font-semibold text-white shadow-[0_10px_24px_rgba(23,54,47,0.16)] transition-all duration-200 active:scale-95 md:hover:-translate-y-0.5 dark:bg-teal-600"
        href="/profile"
        title="Profil"
      >
        {initials}
      </Link>
    </div>
  );
}
