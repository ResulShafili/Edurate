"use client";

import { FileText, LogOut, MessageSquare, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { clearStoredAuth, useAuthUser } from "@/hooks/use-auth-user";

export function ProfileOverview() {
  const router = useRouter();
  const { initials, isReady, user } = useAuthUser();

  if (!isReady) {
    return (
      <div className="grid animate-pulse gap-4 md:grid-cols-2">
        <div className="h-52 rounded-3xl bg-slate-100" />
        <div className="h-52 rounded-3xl bg-slate-100" />
      </div>
    );
  }

  if (!user) {
    return (
      <section className="app-card mx-auto max-w-xl rounded-3xl p-6 text-center">
        <UserRound className="mx-auto size-7 text-teal-700" />
        <h1 className="mt-4 text-2xl font-semibold text-gray-900">Profilinə daxil ol</h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Şəxsi aktivliyini və paylaşdıqlarını görmək üçün kampus hesabına daxil ol.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            className="app-button-secondary flex min-h-[44px] items-center justify-center rounded-2xl px-4 text-sm font-semibold"
            href="/login"
          >
            Giriş
          </Link>
          <Link
            className="app-button-primary flex min-h-[44px] items-center justify-center rounded-2xl px-4 text-sm font-semibold"
            href="/register"
          >
            Qeydiyyat
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-[#dff4ec] text-[#0e7a65] dark:bg-teal-500/10 dark:text-teal-300">
          <UserRound className="size-5" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">Şəxsi məkan</p>
          <h1 className="mt-1 text-2xl font-semibold text-gray-900 md:text-3xl">Profil</h1>
          <p className="mt-1 text-xs text-gray-500">Hesabın və kampus aktivliyin</p>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1fr_1.15fr]">
        <div className="rounded-[1.75rem] border border-[#d6ebe4] bg-[#edf8f4] p-6 shadow-[0_14px_42px_rgba(25,49,42,0.05)] dark:border-teal-500/10 dark:bg-teal-500/10">
          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-[#17362f] text-base font-semibold text-white dark:bg-teal-600">
              {initials}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold text-gray-900">
                {user.fullName || user.username || "Tələbə"}
              </h2>
              <p className="mt-1 truncate text-sm text-gray-500">
                {user.email || "Universitet hesabı"}
              </p>
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-white/80 bg-white/65 p-4 text-sm text-gray-600 dark:border-white/10 dark:bg-white/5">
            <p>{user.faculty || "Qarabağ Universiteti"}</p>
            <p className="mt-1 text-xs text-gray-400">
              {user.courseYear ? `${user.courseYear}-ci kurs` : "Tələbə profili"}
            </p>
          </div>
          <button
            className="mt-5 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border border-orange-100 bg-orange-50 px-4 text-sm font-semibold text-orange-700"
            type="button"
            onClick={() => {
              clearStoredAuth();
              router.push("/login");
            }}
          >
            <LogOut className="size-4" />
            Hesabdan çıx
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            className="interactive-lift rounded-[1.75rem] border border-[#dbe7f5] bg-[#eef4ff] p-6 shadow-[0_12px_36px_rgba(45,76,112,0.05)] dark:border-blue-500/10 dark:bg-blue-500/10"
            href="/resources"
          >
            <FileText className="size-5 text-[#3e6fb1] dark:text-blue-300" />
            <p className="mt-5 text-3xl font-semibold text-gray-900">3</p>
            <p className="mt-1 text-sm text-gray-500">Yüklədiyin material</p>
          </Link>
          <Link
            className="interactive-lift rounded-[1.75rem] border border-[#f3ddcf] bg-[#fff0e6] p-6 shadow-[0_12px_36px_rgba(109,64,42,0.05)] dark:border-orange-500/10 dark:bg-orange-500/10"
            href="/forum"
          >
            <MessageSquare className="size-5 text-orange-600" />
            <p className="mt-5 text-3xl font-semibold text-gray-900">2</p>
            <p className="mt-1 text-sm text-gray-500">Verdiyin sual</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
