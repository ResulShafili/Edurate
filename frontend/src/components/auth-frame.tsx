import {
  ArrowLeft,
  FileText,
  GraduationCap,
  ListChecks,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/theme-toggle";

const benefits = [
  {
    title: "Anonim qiymətləndirmə",
    description: "Müəllim və dərsi təhlükəsiz seçimlərlə qiymətləndir.",
    icon: ListChecks,
  },
  {
    title: "Dərs materialları",
    description: "Konspekt və faydalı PDF-ləri bir yerdə tap.",
    icon: FileText,
  },
  {
    title: "Təhlükəsiz qeydiyyat",
    description: "Yalnız universitet emaili ilə giriş.",
    icon: ShieldCheck,
  },
];

export function AuthFrame({
  children,
  eyebrow,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <main className="min-h-screen bg-[#f4f7f6] px-4 py-5 text-gray-900 dark:bg-[#0b1118]">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link className="flex min-h-[44px] items-center gap-2 text-sm font-semibold text-gray-900" href="/">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-[#17362f] text-white shadow-[0_10px_24px_rgba(23,54,47,0.16)] dark:bg-teal-600">
            <GraduationCap className="size-5" />
          </span>
          EduRate
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            className="app-button-secondary flex min-h-[44px] items-center gap-2 rounded-2xl px-4 text-xs font-medium transition hover:text-gray-900"
            href="/"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Ana səhifə</span>
          </Link>
        </div>
      </div>

      <div className="mx-auto grid min-h-[calc(100vh-76px)] max-w-6xl items-center gap-8 py-6 lg:grid-cols-[0.92fr_1fr] lg:py-8">
        <section className="hidden min-h-[640px] flex-col justify-between overflow-hidden rounded-[2rem] bg-[#17362f] p-8 text-white shadow-[0_20px_55px_rgba(23,54,47,0.16)] lg:flex xl:p-10">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#7de0c8]">
              <span className="size-2 rounded-full bg-[#7de0c8]" />
              Tələbələr üçün
            </p>
            <h1 className="mt-5 max-w-md text-4xl font-semibold leading-tight tracking-normal text-white">
              {title}
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-emerald-50/70">
              EduRate universitet həyatını daha aydın və rahat etmək üçün
              qiymətləndirmələri, sualları və konspektləri bir araya gətirir.
            </p>
          </div>

          <div className="my-8 max-w-md divide-y divide-white/10 border-y border-white/10">
            {benefits.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  className="flex items-center gap-4 py-5"
                  key={item.title}
                >
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-white/8 text-[#7de0c8]">
                    <Icon className="size-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white">{item.title}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-emerald-50/60">
                      {item.description}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 text-xs text-emerald-50/60">
            <div className="flex -space-x-2">
              {["AM", "RS", "NK"].map((initials) => (
                <span className="flex size-8 items-center justify-center rounded-full border-2 border-[#17362f] bg-white/12 text-[9px] font-semibold text-white" key={initials}>
                  {initials}
                </span>
              ))}
            </div>
            Kampus icmasına qoşul
          </div>
        </section>

        <section>
          <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400 lg:text-left">
            {eyebrow}
          </p>
          {children}
        </section>
      </div>
    </main>
  );
}
