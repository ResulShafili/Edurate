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
      <section className="mx-auto max-w-xl rounded-3xl bg-white p-6 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <UserRound className="mx-auto size-7 text-teal-700" />
        <h1 className="mt-4 text-2xl font-semibold text-gray-900">Profilinə daxil ol</h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Şəxsi aktivliyini və paylaşdıqlarını görmək üçün kampus hesabına daxil ol.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            className="flex min-h-[44px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-gray-900"
            href="/login"
          >
            Giriş
          </Link>
          <Link
            className="flex min-h-[44px] items-center justify-center rounded-2xl bg-gray-900 px-4 text-sm font-semibold text-white"
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
      <header>
        <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">Profil</h1>
        <p className="mt-2 text-sm text-gray-500">Hesabın və kampus aktivliyin.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-[1fr_1.15fr]">
        <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-full bg-gray-900 text-base font-semibold text-white">
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
          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-gray-600">
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
            className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-200 md:hover:-translate-y-1 md:hover:shadow-md"
            href="/resources"
          >
            <FileText className="size-5 text-teal-700" />
            <p className="mt-5 text-3xl font-semibold text-gray-900">3</p>
            <p className="mt-1 text-sm text-gray-500">Yüklədiyin material</p>
          </Link>
          <Link
            className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-200 md:hover:-translate-y-1 md:hover:shadow-md"
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
