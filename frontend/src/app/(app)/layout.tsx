import type { ReactNode } from "react";

import { AppNavigation } from "@/components/app-navigation";

export default function MainAppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#f2f7f5_46%,#f8fafc_100%)] text-gray-900">
      <AppNavigation />
      <main className="min-h-screen overflow-x-hidden pb-24 md:pb-8 md:pl-[248px]">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
