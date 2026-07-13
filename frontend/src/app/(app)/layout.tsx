import type { ReactNode } from "react";

import { AppHeader } from "@/components/app-header";
import { AppNavigation } from "@/components/app-navigation";

export default function MainAppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f7f6] text-gray-900 dark:bg-[#0b1118]">
      <AppNavigation />
      <div className="md:pl-[260px]">
        <AppHeader />
        <main className="min-h-[calc(100vh-72px)] overflow-x-hidden pb-24 md:pb-10">
          <div className="page-enter mx-auto w-full max-w-[1460px] px-4 py-5 sm:px-6 md:px-8 md:py-8 lg:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
