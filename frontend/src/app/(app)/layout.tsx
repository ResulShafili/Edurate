import type { ReactNode } from "react";

import { AppHeader } from "@/components/app-header";
import { AppNavigation } from "@/components/app-navigation";

export default function MainAppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#f2f7f5_46%,#f8fafc_100%)] text-gray-900 dark:bg-[#0b1118] dark:bg-none">
      <AppNavigation />
      <div className="md:pl-[248px]">
        <AppHeader />
        <main className="min-h-[calc(100vh-68px)] overflow-x-hidden pb-24 md:pb-8">
          <div className="page-enter mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 md:px-8 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
