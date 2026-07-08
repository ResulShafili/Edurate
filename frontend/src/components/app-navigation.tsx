"use client";

import {
  FileText,
  Home,
  MessageSquare,
  PanelLeft,
  ShoppingBag,
  Star,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Ana səhifə", icon: Home },
  { href: "/professors", label: "Rəylər", icon: Star },
  { href: "/forum", label: "Forum", icon: MessageSquare },
  { href: "/resources", label: "Resurs", icon: FileText },
  { href: "/swap", label: "Swap", icon: ShoppingBag },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] border-r border-slate-200/70 bg-white px-4 py-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:flex md:flex-col">
        <div className="flex items-center gap-3 px-2">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <PanelLeft className="size-5" />
          </div>
          <div>
            <p className="text-base font-semibold leading-5 text-gray-900">EduRate</p>
            <p className="text-xs text-gray-400">Kampus paneli</p>
          </div>
        </div>

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);

            return (
              <Link
                className={`flex min-h-[44px] items-center gap-3 rounded-2xl px-4 text-sm font-medium transition-all duration-300 ${
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
      </aside>

      <nav className="fixed inset-x-6 bottom-3 z-40 grid h-14 grid-cols-5 rounded-[1.6rem] border border-white/70 bg-white/82 p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.07)] backdrop-blur-md md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);

          return (
            <Link
              aria-label={item.label}
              className={`flex min-h-[44px] items-center justify-center rounded-2xl transition ${
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
