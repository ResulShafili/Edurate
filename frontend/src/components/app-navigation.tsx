"use client";

import {
  ChevronUp,
  FileText,
  GraduationCap,
  Home,
  LogIn,
  LogOut,
  MessageSquare,
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
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] border-r border-[#dfe8e4] bg-white/95 px-4 py-5 backdrop-blur-xl dark:border-white/10 dark:bg-[#111820]/95 md:flex md:flex-col">
        <Link className="flex items-center gap-3 px-2" href="/">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-[#17362f] text-white shadow-[0_10px_24px_rgba(23,54,47,0.18)] dark:bg-teal-600">
            <GraduationCap className="size-5" />
          </span>
          <span>
            <span className="block text-base font-semibold leading-5 text-gray-900">EduRate</span>
            <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-gray-400">
              <span className="size-1.5 rounded-full bg-[#35a58c]" />
              Qarabağ Universiteti
            </span>
          </span>
        </Link>

        <p className="mt-9 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
          Kampus
        </p>
        <nav className="mt-3 space-y-1.5" aria-label="Əsas naviqasiya">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);

            return (
              <Link
                className={`group flex min-h-[46px] items-center gap-3 rounded-2xl px-3.5 text-sm font-medium transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                  active
                    ? "bg-[#e7f5f0] text-[#0e705e] dark:bg-teal-500/10 dark:text-teal-300"
                    : "text-gray-500 hover:bg-[#f4f7f6] hover:text-gray-900 dark:hover:bg-white/5"
                }`}
                href={item.href}
                key={item.href}
              >
                <span className={`flex size-8 items-center justify-center rounded-xl ${active ? "bg-white/80 dark:bg-white/5" : ""}`}>
                  <Icon className="size-4" />
                </span>
                <span className="flex-1">{item.label}</span>
                {active && <span className="size-1.5 rounded-full bg-[#35a58c]" />}
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
              <div className="rounded-2xl border border-[#dcebe6] bg-[#eff8f5] p-4 dark:border-teal-500/10 dark:bg-teal-500/10">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0e7a65] dark:text-teal-300">
                  Sənin aktivliyin
                </p>
                <div className="mt-3 space-y-2.5 text-xs text-gray-600">
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
                <summary className="app-card flex min-h-[62px] cursor-pointer list-none items-center gap-3 rounded-2xl p-3 transition hover:border-teal-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 [&::-webkit-details-marker]:hidden">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#17362f] text-xs font-semibold text-white dark:bg-teal-600">
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

                <div className="app-surface absolute inset-x-0 bottom-[calc(100%+8px)] rounded-2xl p-2">
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
            <div className="rounded-2xl border border-[#f3ddcf] bg-[#fff5ef] p-4 dark:border-orange-500/10 dark:bg-orange-500/10">
              <p className="text-sm font-semibold text-gray-900">Kampus hesabına qoşul</p>
              <p className="mt-1 text-xs leading-5 text-gray-500">
                Rəy, sual və material paylaşmaq üçün daxil ol.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  className="app-button-secondary flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl text-xs font-semibold"
                  href="/login"
                >
                  <LogIn className="size-3.5" />
                  Giriş
                </Link>
                <Link
                  className="app-button-primary flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl text-xs font-semibold"
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
        className="fixed inset-x-4 bottom-3 z-40 grid h-16 grid-cols-4 rounded-[1.7rem] border border-white/80 bg-white/88 p-1.5 shadow-[0_14px_40px_rgba(25,49,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-[#151c24]/92 md:hidden"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);

          return (
            <Link
              aria-label={item.label}
              className={`relative flex min-h-[48px] items-center justify-center rounded-2xl transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                active
                  ? "bg-[#e4f4ee] text-[#0e7a65] dark:bg-teal-500/10 dark:text-teal-300"
                  : "text-gray-400 hover:text-gray-700"
              }`}
              href={item.href}
              key={item.href}
            >
              <Icon className="size-[18px]" />
              {active && <span className="absolute bottom-1.5 size-1 rounded-full bg-[#35a58c]" />}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
