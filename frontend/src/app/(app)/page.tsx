import {
  ArrowRight,
  BookOpen,
  Clock3,
  FileText,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { getQuestionSlug, mockQuestions } from "@/lib/forum";
import { getProfessorSlug, mockProfessors } from "@/lib/professors";

export const metadata: Metadata = {
  title: "EduRate — Qarabağ Universiteti tələbə platforması",
  description: "Müəllim qiymətləndirmələri, fənn forumu və dərs materialları bir kampus platformasında.",
};

const modules = [
  {
    title: "Müəllim qiymətləri",
    description: "Strukturlaşdırılmış nəticələrə bax",
    metric: "128 aktiv qiymət",
    href: "/professors",
    icon: Star,
    iconTone: "bg-[#fff0e6] text-[#d75a34] dark:bg-orange-500/10 dark:text-orange-300",
    accent: "bg-[#ed7650]",
  },
  {
    title: "Sual-cavab",
    description: "Kampusdan cavab al",
    metric: "42 açıq sual",
    href: "/forum",
    icon: MessageSquare,
    iconTone: "bg-[#dff4ec] text-[#0e7a65] dark:bg-teal-500/10 dark:text-teal-300",
    accent: "bg-[#35a58c]",
  },
  {
    title: "Materiallar",
    description: "Konspekt və PDF-ləri tap",
    metric: "316 fayl",
    href: "/resources",
    icon: FileText,
    iconTone: "bg-[#e9f1ff] text-[#3e6fb1] dark:bg-blue-500/10 dark:text-blue-300",
    accent: "bg-[#6e9fe0]",
  },
  {
    title: "Aktiv kurslar",
    description: "Fənn axınına qoşul",
    metric: "24 kurs",
    href: "/forum",
    icon: BookOpen,
    iconTone: "bg-[#fff6cf] text-[#8b6a00] dark:bg-yellow-500/10 dark:text-yellow-200",
    accent: "bg-[#dfbc3c]",
  },
];

const pulseStats = [
  ["544", "aktiv tələbə"],
  ["4.7", "orta reytinq"],
  ["86", "bu həftə paylaşım"],
];

const campusActivity = [
  {
    title: "Yeni alqoritmlər qiyməti",
    meta: "Nigar Mammadova · 8 dəq əvvəl",
    icon: Star,
    tone: "bg-[#fff0e6] text-[#d75a34] dark:bg-orange-500/10 dark:text-orange-300",
  },
  {
    title: "Express.js cheat sheet paylaşıldı",
    meta: "CS201 · 24 dəq əvvəl",
    icon: FileText,
    tone: "bg-[#e9f1ff] text-[#3e6fb1] dark:bg-blue-500/10 dark:text-blue-300",
  },
  {
    title: "Database mövzusuna cavab gəldi",
    meta: "CS305 · 1 saat əvvəl",
    icon: MessageSquare,
    tone: "bg-[#dff4ec] text-[#0e7a65] dark:bg-teal-500/10 dark:text-teal-300",
  },
];

export default function HomePage() {
  const featuredQuestion = mockQuestions[2];

  return (
    <div className="space-y-7 md:space-y-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0e7a65]">
            <Sparkles className="size-3.5" />
            Kampusuna xoş gəldin
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal text-gray-900 md:text-[2rem]">
            Bu gün nəyi həll edirik?
          </h1>
          <p className="mt-2 hidden max-w-xl text-sm leading-6 text-gray-500 sm:block">
            Qiymətləndirmə, sual və dərs materialları tələbə həyatını bir az daha rahat etsin.
          </p>
        </div>
        <div className="hidden items-center gap-2 rounded-full bg-[#dff4ec] px-3 py-2 text-xs font-medium text-[#0e7a65] dark:bg-teal-500/10 dark:text-teal-300 lg:flex">
          <span className="size-2 rounded-full bg-[#35a58c]" />
          Kampus aktivdir
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.65fr)]">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#17362f] p-5 text-white shadow-[0_18px_50px_rgba(23,54,47,0.16)] sm:p-7 lg:min-h-[330px] lg:p-8">
          <div className="relative z-10 grid h-full gap-8 md:grid-cols-[minmax(0,1fr)_260px] md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[11px] font-medium text-emerald-50">
                <ShieldCheck className="size-3.5 text-[#7de0c8]" />
                Yalnız universitet icması
              </div>
              <h2 className="mt-5 max-w-xl text-2xl font-semibold leading-tight tracking-normal sm:text-3xl lg:text-[2.25rem]">
                Kampus təcrübəsi paylaşdıqca dəyər qazanır.
              </h2>
              <p className="mt-3 hidden max-w-xl text-sm leading-6 text-emerald-50/70 sm:block">
                Müəllim seçimini daha inamlı et, fənn sualını cavabsız qoyma və faydalı konspekti vaxtında tap.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                <Link
                  className="flex min-h-[46px] items-center justify-center gap-2 rounded-2xl bg-[#ffffff] px-5 text-sm font-semibold text-[#17362f] transition active:scale-[0.98] hover:bg-[#f4f7f6]"
                  href="/professors"
                >
                  Müəllim tap
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  className="flex min-h-[46px] items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-5 text-sm font-semibold text-white transition active:scale-[0.98] hover:bg-white/12"
                  href="/forum"
                >
                  Sual ver
                  <MessageSquare className="size-4" />
                </Link>
              </div>
            </div>

            <div className="hidden divide-y divide-white/10 border-l border-white/10 pl-7 md:block">
              {pulseStats.map(([value, label]) => (
                <div className="flex items-center justify-between gap-5 py-3 first:pt-0 last:pb-0" key={label}>
                  <p className="text-2xl font-semibold">{value}</p>
                  <p className="text-right text-xs text-emerald-50/60">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Link
          className="interactive-lift relative flex min-h-[180px] flex-col justify-between overflow-hidden rounded-[2rem] border border-[#f6d8c7] bg-[#fff0e6] p-5 shadow-[0_12px_36px_rgba(109,64,42,0.06)] dark:border-orange-500/10 dark:bg-orange-500/10 sm:p-6 lg:min-h-[330px]"
          href={`/forum/${getQuestionSlug(featuredQuestion)}`}
        >
          <div className="flex items-start justify-between gap-4">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-white/75 text-[#d75a34] dark:bg-white/5 dark:text-orange-300">
              <TrendingUp className="size-5" />
            </span>
            <span className="rounded-full bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-[#9b492f] dark:bg-white/5 dark:text-orange-200">
              Həftənin sualı
            </span>
          </div>
          <div className="mt-5 lg:mt-7">
            <p className="text-xs font-semibold text-[#9b492f] dark:text-orange-200">
              {featuredQuestion.courseCode}
            </p>
            <h2 className="mt-2 text-lg font-semibold leading-7 text-gray-900 lg:text-xl">
              {featuredQuestion.title}
            </h2>
            <div className="mt-5 flex items-center justify-between gap-3 text-xs text-[#9b6a58] dark:text-orange-200/70">
              <span className="flex items-center gap-1.5">
                <Users className="size-3.5" />
                {featuredQuestion.voteScore} faydalı səs
              </span>
              <ArrowRight className="size-4" />
            </div>
          </div>
        </Link>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Qısa yollar</h2>
            <p className="mt-1 text-xs text-gray-400">Lazım olan bölməyə bir toxunuşla keç</p>
          </div>
        </div>

        <div className="stagger-grid grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {modules.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                className="app-card interactive-lift group relative min-h-[158px] overflow-hidden rounded-[1.65rem] p-4 sm:p-5 md:min-h-[184px]"
                href={item.href}
                key={item.title}
              >
                <span className={`absolute inset-x-5 top-0 h-1 rounded-b-full ${item.accent}`} />
                <div className="flex items-start justify-between gap-3">
                  <span className={`flex size-11 items-center justify-center rounded-2xl ${item.iconTone}`}>
                    <Icon className="size-[18px]" />
                  </span>
                  <ArrowRight className="size-4 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-gray-600" />
                </div>
                <div className="mt-5">
                  <h3 className="text-sm font-semibold leading-5 text-gray-900 sm:text-base">{item.title}</h3>
                  <p className="mt-1 hidden text-xs leading-5 text-gray-500 sm:block">{item.description}</p>
                  <p className="mt-2 text-[11px] font-medium text-gray-400">{item.metric}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="hidden gap-4 md:grid lg:grid-cols-[1.08fr_0.92fr]">
        <div className="app-card rounded-[1.75rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Yüksək qiymətləndirilənlər</h2>
              <p className="mt-1 text-xs text-gray-400">Son tələbə qiymətləndirmələrinə əsasən</p>
            </div>
            <Link className="text-xs font-semibold text-[#0e7a65] hover:underline" href="/professors">
              Hamısına bax
            </Link>
          </div>

          <div className="mt-5 divide-y divide-slate-100">
            {mockProfessors.slice(0, 3).map((professor, index) => (
              <Link
                className="group flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                href={`/professors/${getProfessorSlug(professor)}`}
                key={professor.id}
              >
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold ${
                    index === 0
                      ? "bg-[#fff0e6] text-[#d75a34] dark:bg-orange-500/10 dark:text-orange-300"
                      : index === 1
                        ? "bg-[#dff4ec] text-[#0e7a65] dark:bg-teal-500/10 dark:text-teal-300"
                        : "bg-[#e9f1ff] text-[#3e6fb1] dark:bg-blue-500/10 dark:text-blue-300"
                  }`}
                >
                  {professor.fullName
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-gray-900">{professor.fullName}</span>
                  <span className="mt-1 block truncate text-xs text-gray-400">{professor.departmentName}</span>
                </span>
                <span className="flex items-center gap-1 rounded-full bg-[#fff6cf] px-3 py-1.5 text-xs font-semibold text-[#745900] dark:bg-yellow-500/10 dark:text-yellow-200">
                  <Star className="size-3.5 fill-current" />
                  {professor.averageRating.toFixed(1)}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[#d7e9e3] bg-[#eaf6f2] p-6 dark:border-teal-500/10 dark:bg-teal-500/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Kampusda indi</h2>
              <p className="mt-1 text-xs text-gray-500">Son icma fəaliyyəti</p>
            </div>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#0e7a65] dark:text-teal-300">
              <span className="size-2 rounded-full bg-[#35a58c]" />
              Canlı
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {campusActivity.map((item) => {
              const Icon = item.icon;

              return (
                <div className="flex items-center gap-3" key={item.title}>
                  <span className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${item.tone}`}>
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="mt-1 flex items-center gap-1.5 truncate text-[11px] text-gray-400">
                      <Clock3 className="size-3" />
                      {item.meta}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
