import { GraduationCap } from "lucide-react";
import Link from "next/link";

import { GlobalSearch } from "@/components/global-search";
import { NotificationCenter } from "@/components/notification-center";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserActions } from "@/components/user-actions";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-slate-50/85 backdrop-blur-md dark:bg-[#0f161e]/90">
      <div className="mx-auto flex h-[68px] w-full max-w-[1400px] items-center gap-2 px-4 sm:px-6 md:justify-end md:px-8">
        <Link
          aria-label="EduRate ana səhifə"
          className="mr-auto flex items-center gap-2 text-sm font-semibold text-gray-900 md:hidden"
          href="/"
        >
          <span className="flex size-10 items-center justify-center rounded-2xl bg-gray-900 text-white">
            <GraduationCap className="size-5" />
          </span>
          <span className="hidden min-[390px]:inline">EduRate</span>
        </Link>

        <GlobalSearch />
        <ThemeToggle />
        <NotificationCenter />
        <UserActions />
      </div>
    </header>
  );
}
