import { GraduationCap } from "lucide-react";
import Link from "next/link";

import { GlobalSearch } from "@/components/global-search";
import { NotificationCenter } from "@/components/notification-center";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserActions } from "@/components/user-actions";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[#dfe8e4]/80 bg-[#f4f7f6]/88 backdrop-blur-xl dark:border-white/10 dark:bg-[#0f161e]/90">
      <div className="mx-auto flex h-[72px] w-full max-w-[1460px] items-center gap-2 px-4 sm:px-6 md:px-8 lg:px-10">
        <Link
          aria-label="EduRate ana səhifə"
          className="mr-auto flex items-center gap-2.5 text-sm font-semibold text-gray-900 md:hidden"
          href="/"
        >
          <span className="flex size-11 items-center justify-center rounded-2xl bg-[#17362f] text-white shadow-[0_8px_20px_rgba(23,54,47,0.16)] dark:bg-teal-600">
            <GraduationCap className="size-5" />
          </span>
          <span className="hidden min-[410px]:inline">EduRate</span>
        </Link>

        <div className="md:mr-auto">
          <GlobalSearch />
        </div>
        <ThemeToggle />
        <NotificationCenter />
        <UserActions />
      </div>
    </header>
  );
}
