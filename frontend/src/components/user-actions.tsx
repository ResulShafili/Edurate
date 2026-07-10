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
          className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-medium text-gray-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-200 active:scale-[0.98] md:hover:-translate-y-0.5 md:hover:shadow-md lg:px-4"
          href="/login"
        >
          <LogIn className="size-4" />
          <span className="hidden lg:inline">Giriş</span>
        </Link>
        <Link
          aria-label="Qeydiyyat"
          className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-2xl bg-gray-900 px-3 text-sm font-medium text-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-200 active:scale-[0.98] md:hover:-translate-y-0.5 md:hover:shadow-md lg:px-4"
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
        className="flex size-11 items-center justify-center rounded-2xl bg-gray-900 text-sm font-semibold text-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-200 active:scale-95 md:hover:-translate-y-0.5 md:hover:shadow-md"
        href="/profile"
        title="Profil"
      >
        {initials}
      </Link>
    </div>
  );
}
