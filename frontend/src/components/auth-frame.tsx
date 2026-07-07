import {
  ArrowLeft,
  GraduationCap,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const benefits = [
  {
    title: "Anonim rəylər",
    description: "Dərs və müəllim təcrübəni rahat paylaş.",
    icon: MessageCircle,
  },
  {
    title: "Kampus bazarı",
    description: "Kitab və əşyaları tələbələrlə dəyiş.",
    icon: ShoppingBag,
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(223,231,225,0.62),transparent_34%),linear-gradient(135deg,#f8f7f3_0%,#f2f4f1_48%,#f7f2ef_100%)] px-4 py-5">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link className="flex items-center gap-2 text-sm font-semibold" href="/">
          <span className="flex size-9 items-center justify-center rounded-lg bg-ink text-white">
            <GraduationCap className="size-5" />
          </span>
          EduRate
        </Link>
        <Link
          className="flex h-9 items-center gap-2 rounded-lg border border-line bg-white/72 px-3 text-xs font-medium text-muted shadow-[0_10px_24px_rgba(39,35,29,0.06)] backdrop-blur-md transition hover:text-foreground"
          href="/"
        >
          <ArrowLeft className="size-4" />
          Ana səhifə
        </Link>
      </div>

      <div className="mx-auto grid min-h-[calc(100vh-76px)] max-w-6xl items-center gap-8 lg:grid-cols-[0.92fr_1fr]">
        <section className="hidden lg:block">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
            Tələbələr üçün
          </p>
          <h1 className="mt-4 max-w-md text-4xl font-semibold leading-tight tracking-normal text-foreground">
            {title}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted">
            EduRate universitet həyatını daha aydın və rahat etmək üçün
            rəyləri, sualları, konspektləri və kampus elanlarını bir araya
            gətirir.
          </p>
          <div className="mt-6 grid max-w-md gap-2">
            {benefits.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  className="flex items-center gap-3 rounded-lg border border-white/70 bg-white/76 p-3 shadow-[0_14px_30px_rgba(39,35,29,0.06)] backdrop-blur-xl"
                  key={item.title}
                >
                  <span className="flex size-9 items-center justify-center rounded-lg bg-[#eef6f1] text-sage">
                    <Icon className="size-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{item.title}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-muted">
                      {item.description}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <p className="mb-3 text-center text-xs font-medium uppercase tracking-[0.18em] text-muted lg:text-left">
            {eyebrow}
          </p>
          {children}
        </section>
      </div>
    </main>
  );
}
