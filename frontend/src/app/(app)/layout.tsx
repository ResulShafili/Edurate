import type { ReactNode } from "react";

import { AppNavigation } from "@/components/app-navigation";

export default function MainAppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(223,231,225,0.52),transparent_34%),linear-gradient(135deg,#f8f7f3_0%,#f2f4f1_48%,#f7f2ef_100%)] lg:h-auto lg:min-h-screen lg:overflow-visible">
      <AppNavigation />
      <main className="h-[calc(100vh-86px)] overflow-y-auto overscroll-contain lg:h-auto lg:min-h-screen lg:overflow-visible lg:pb-0 lg:pl-[232px]">
        <div className="mx-auto w-full max-w-[1380px] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
