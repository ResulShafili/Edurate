"use client";

import {
  Bell,
  FileText,
  Home,
  LogIn,
  MessageSquare,
  PanelLeft,
  Settings,
  ShoppingBag,
  Star,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Ana səhifə", icon: Home },
  { href: "/reviews", label: "Rəylər", icon: Star },
  { href: "/forum", label: "Forum", icon: MessageSquare },
  { href: "/notes", label: "PDF", icon: FileText },
  { href: "/swap", label: "Swap", icon: ShoppingBag },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] border-r border-white/70 bg-white/72 px-3 py-4 shadow-[14px_0_44px_rgba(39,35,29,0.06)] backdrop-blur-xl lg:flex lg:flex-col">
        <div className="flex items-center gap-3 px-2">
          <div className="flex size-10 items-center justify-center rounded-lg bg-ink text-white shadow-[0_12px_24px_rgba(38,52,47,0.18)]">
            <PanelLeft className="size-5" />
          </div>
          <div>
            <p className="text-base font-semibold leading-5">EduRate</p>
            <p className="text-xs text-muted">Campus OS</p>
          </div>
        </div>

        <nav className="mt-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);

            return (
              <Link
                className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${
                  active
                    ? "bg-ink text-white shadow-[0_12px_26px_rgba(38,52,47,0.16)]"
                    : "text-muted hover:bg-white hover:text-foreground"
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

        <div className="mt-auto space-y-2">
          <Link
            className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted transition hover:bg-white hover:text-foreground"
            href="/settings"
          >
            <Settings className="size-4" />
            Tənzimləmələr
          </Link>
          <div className="rounded-lg border border-line bg-white/78 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Modul A</span>
              <Bell className="size-4 text-sage" />
            </div>
            <p className="mt-1 text-xs leading-5 text-muted">
              Auth ekranları hazırdır.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link
                className="flex h-9 items-center justify-center gap-1 rounded-lg border border-line bg-white text-xs font-medium"
                href="/login"
              >
                <LogIn className="size-3.5" />
                Giriş
              </Link>
              <Link
                className="flex h-9 items-center justify-center gap-1 rounded-lg bg-ink text-xs font-medium text-white"
                href="/register"
              >
                <UserPlus className="size-3.5" />
                Qeydiyyat
              </Link>
            </div>
          </div>
        </div>
      </aside>

      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-lg border border-white/70 bg-white/86 p-1 shadow-[0_18px_42px_rgba(39,35,29,0.16)] backdrop-blur-xl lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);

          return (
            <Link
              aria-label={item.label}
              className={`flex h-12 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium transition ${
                active ? "bg-ink text-white" : "text-muted"
              }`}
              href={item.href}
              key={item.href}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
