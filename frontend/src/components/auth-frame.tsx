import {
  ArrowLeft,
  FileText,
  GraduationCap,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/theme-toggle";

const benefits = [
  {
    title: "Anonim rəylər",
    description: "Dərs və müəllim təcrübəni rahat paylaş.",
    icon: MessageCircle,
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
    <main className="min-h-screen bg-slate-50 px-4 py-5 text-gray-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link className="flex min-h-[44px] items-center gap-2 text-sm font-semibold text-gray-900" href="/">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-gray-900 text-white">
            <GraduationCap className="size-5" />
          </span>
          EduRate
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            className="flex min-h-[44px] items-center gap-2 rounded-2xl bg-white px-4 text-xs font-medium text-gray-600 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition hover:text-gray-900"
            href="/"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Ana səhifə</span>
          </Link>
        </div>
      </div>

      <div className="mx-auto grid min-h-[calc(100vh-76px)] max-w-6xl items-center gap-8 lg:grid-cols-[0.92fr_1fr]">
        <section className="hidden lg:block">
          <p className="text-xs font-medium uppercase tracking-normal text-gray-400">
            Tələbələr üçün
          </p>
          <h1 className="mt-4 max-w-md text-4xl font-semibold leading-tight tracking-normal text-gray-900">
            {title}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-gray-600">
            EduRate universitet həyatını daha aydın və rahat etmək üçün
            rəyləri, sualları və konspektləri bir araya
            gətirir.
          </p>
          <div className="mt-6 grid max-w-md gap-4">
            {benefits.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                  key={item.title}
                >
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                    <Icon className="size-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-gray-900">{item.title}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-gray-500">
                      {item.description}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-normal text-gray-400 lg:text-left">
            {eyebrow}
          </p>
          {children}
        </section>
      </div>
    </main>
  );
}
