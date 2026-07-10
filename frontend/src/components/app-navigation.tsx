"use client";

import {
  ChevronUp,
  FileText,
  Home,
  LogIn,
  LogOut,
  MessageSquare,
  PanelLeft,
  Star,
  UserRound,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { clearStoredAuth, useAuthUser } from "@/hooks/use-auth-user";

const navItems = [
  { href: "/", label: "Ana səhifə", icon: Home },
  { href: "/professors", label: "Rəylər", icon: Star },
  { href: "/forum", label: "Forum", icon: MessageSquare },
  { href: "/resources", label: "Resurs", icon: FileText },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { initials, isReady, user } = useAuthUser();

  function handleLogout() {
    clearStoredAuth();
    router.push("/login");
  }

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] border-r border-slate-200/70 bg-white px-4 py-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:flex md:flex-col">
        <Link className="flex items-center gap-3 px-2" href="/">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <PanelLeft className="size-5" />
          </span>
          <span>
            <span className="block text-base font-semibold leading-5 text-gray-900">EduRate</span>
            <span className="block text-xs text-gray-400">Kampus paneli</span>
          </span>
        </Link>

        <nav className="mt-8 space-y-2" aria-label="Əsas naviqasiya">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);

            return (
              <Link
                className={`flex min-h-[44px] items-center gap-3 rounded-2xl px-4 text-sm font-medium transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                  active
                    ? "bg-gray-900 text-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                    : "text-gray-600 hover:-translate-y-0.5 hover:bg-slate-50 hover:text-gray-900"
                }`}
                href={item.href}
                key={item.href}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 pt-5">
          {!isReady && (
            <div className="h-28 animate-pulse rounded-2xl bg-slate-100" aria-label="Profil yüklənir" />
          )}

          {isReady && user && (
            <>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[11px] font-medium uppercase tracking-normal text-gray-400">
                  Sənin aktivliyin
                </p>
                <div className="mt-3 space-y-2 text-xs text-gray-600">
                  <div className="flex items-center justify-between gap-3">
                    <span>Yüklədiyin materiallar</span>
                    <span className="font-semibold text-gray-900">3</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Verdiyin suallar</span>
                    <span className="font-semibold text-gray-900">2</span>
                  </div>
                </div>
              </div>

              <details className="group relative">
                <summary className="flex min-h-[60px] cursor-pointer list-none items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 [&::-webkit-details-marker]:hidden">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                    {initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-gray-900">
                      {user.fullName || user.username || "Tələbə"}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-gray-400">
                      {user.faculty || "Qarabağ Universiteti"}
                      {user.courseYear ? ` · ${user.courseYear}-ci kurs` : ""}
                    </span>
                  </span>
                  <ChevronUp className="size-4 text-gray-400 transition group-open:rotate-180" />
                </summary>

                <div className="absolute inset-x-0 bottom-[calc(100%+8px)] rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                  <Link
                    className="flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-xs font-medium text-gray-600 hover:bg-slate-50 hover:text-gray-900"
                    href="/profile"
                  >
                    <UserRound className="size-4" />
                    Profil
                  </Link>
                  <button
                    className="flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 text-xs font-medium text-orange-600 hover:bg-orange-50"
                    type="button"
                    onClick={handleLogout}
                  >
                    <LogOut className="size-4" />
                    Çıxış
                  </button>
                </div>
              </details>
            </>
          )}

          {isReady && !user && (
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-gray-900">Kampus hesabına qoşul</p>
              <p className="mt-1 text-xs leading-5 text-gray-500">
                Rəy, sual və material paylaşmaq üçün daxil ol.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-gray-700"
                  href="/login"
                >
                  <LogIn className="size-3.5" />
                  Giriş
                </Link>
                <Link
                  className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-gray-900 text-xs font-semibold text-white"
                  href="/register"
                >
                  <UserPlus className="size-3.5" />
                  Qeydiyyat
                </Link>
              </div>
            </div>
          )}
        </div>
      </aside>

      <nav
        aria-label="Mobil naviqasiya"
        className="fixed inset-x-6 bottom-3 z-40 grid h-14 grid-cols-4 rounded-[1.6rem] border border-white/70 bg-white/82 p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.07)] backdrop-blur-md dark:bg-[#151c24]/90 md:hidden"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);

          return (
            <Link
              aria-label={item.label}
              className={`flex min-h-[44px] items-center justify-center rounded-2xl transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                active ? "bg-gray-900 text-white" : "text-gray-400"
              }`}
              href={item.href}
              key={item.href}
            >
              <Icon className="size-[18px]" />
            </Link>
          );
        })}
      </nav>
    </>
  );
}
