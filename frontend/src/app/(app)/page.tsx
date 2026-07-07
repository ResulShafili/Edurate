import {
  BookOpen,
  ChevronRight,
  CircleCheck,
  FileText,
  GraduationCap,
  MessageSquare,
  Search,
  ShoppingBag,
  Star,
  Upload,
  Users,
} from "lucide-react";
import Link from "next/link";

import { UserActions } from "@/components/user-actions";

const modules = [
  {
    title: "Müəllim rəyləri",
    subtitle: "128 aktiv rəy",
    href: "/reviews",
    icon: Star,
    tone: "text-clay bg-[#fff4ef]",
  },
  {
    title: "Sual-cavab forumu",
    subtitle: "42 açıq sual",
    href: "/forum",
    icon: MessageSquare,
    tone: "text-sage bg-[#eef6f1]",
  },
  {
    title: "PDF konspektlər",
    subtitle: "316 fayl",
    href: "/notes",
    icon: FileText,
    tone: "text-[#64748b] bg-[#f1f5f9]",
  },
  {
    title: "Kampus swap",
    subtitle: "58 elan",
    href: "/swap",
    icon: ShoppingBag,
    tone: "text-[#8a6f45] bg-[#fbf4e5]",
  },
];

const recentQuestions = [
  "Data Structures imtahanına necə hazırlaşım?",
  "Qeydiyyat emaili gəlmirsə nə etməliyəm?",
  "Calculus 2 üçün ən yaxşı konspekt hansıdır?",
];

const teacherRows = [
  ["Nigar Mammadova", "Algorithms", "4.8"],
  ["Elvin Huseynli", "Databases", "4.6"],
  ["Aysel Karimova", "Web Stack", "4.5"],
];

const cardMotion =
  "transition-all duration-300 hover:-translate-y-1 hover:shadow-md";

export default function HomePage() {
  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
            EduRate Kampus
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
            Ana səhifə
          </h1>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative block w-full sm:w-[320px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              className="h-10 w-full rounded-lg border border-line bg-white/78 pl-9 pr-3 text-sm shadow-[0_10px_28px_rgba(31,28,24,0.06)] outline-none backdrop-blur-md transition focus:border-sage"
              placeholder="Müəllim, kurs, konspekt axtar"
              type="search"
            />
          </label>
          <UserActions />
        </div>
      </header>

      <section className="grid gap-3 lg:grid-cols-[1.36fr_0.82fr]">
        <div
          className={`rounded-lg border border-white/70 bg-white/80 p-4 shadow-[0_18px_45px_rgba(39,35,29,0.08)] backdrop-blur-xl ${cardMotion}`}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/72 px-3 py-1 text-xs font-medium text-muted">
                <CircleCheck className="size-3.5 text-sage" />
                Universitet emaili ilə qorunan platforma
              </div>
              <h2 className="mt-4 max-w-2xl text-2xl font-semibold leading-tight text-foreground sm:text-[34px]">
                Rəylər, suallar, konspektlər və kampus alış-verişi eyni yerdə.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Komandanın gündəlik istifadə edəcəyi yığcam kampus paneli.
                Bütün modullar eyni istifadəçi hesabı və universitet konteksti
                ilə işləyir.
              </p>
            </div>

            <div className="grid min-w-[220px] grid-cols-2 gap-2">
              <div className={`rounded-lg border border-line bg-white p-3 ${cardMotion}`}>
                <p className="text-2xl font-semibold">544</p>
                <p className="text-xs text-muted">Aktiv tələbə</p>
              </div>
              <div className={`rounded-lg border border-line bg-white p-3 ${cardMotion}`}>
                <p className="text-2xl font-semibold">4.7</p>
                <p className="text-xs text-muted">Orta reytinq</p>
              </div>
              <div className={`rounded-lg border border-line bg-white p-3 ${cardMotion}`}>
                <p className="text-2xl font-semibold">316</p>
                <p className="text-xs text-muted">PDF fayl</p>
              </div>
              <div className={`rounded-lg border border-line bg-white p-3 ${cardMotion}`}>
                <p className="text-2xl font-semibold">58</p>
                <p className="text-xs text-muted">Swap elanı</p>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`rounded-lg border border-white/70 bg-white/80 p-4 shadow-[0_18px_45px_rgba(39,35,29,0.08)] backdrop-blur-xl ${cardMotion}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Bugünkü axın</p>
              <p className="text-xs text-muted">Canlı kampus aktivliyi</p>
            </div>
            <Upload className="size-5 text-sage" />
          </div>
          <div className="mt-4 space-y-3">
            {recentQuestions.map((question) => (
              <button
                className="flex w-full items-center justify-between rounded-lg border border-line bg-white px-3 py-2 text-left text-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-sage/45 hover:shadow-md"
                key={question}
                type="button"
              >
                <span className="line-clamp-1">{question}</span>
                <ChevronRight className="size-4 shrink-0 text-muted" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {modules.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              className={`group flex min-h-[116px] flex-col justify-between rounded-lg border border-white/70 bg-white/84 p-4 text-left shadow-[0_14px_34px_rgba(39,35,29,0.06)] backdrop-blur-xl ${cardMotion}`}
              href={item.href}
              key={item.title}
            >
              <span className={`flex size-9 items-center justify-center rounded-lg ${item.tone}`}>
                <Icon className="size-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold">{item.title}</span>
                <span className="mt-1 block text-xs text-muted">{item.subtitle}</span>
              </span>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
        <div
          className={`rounded-lg border border-white/70 bg-white/84 p-4 shadow-[0_14px_34px_rgba(39,35,29,0.06)] backdrop-blur-xl ${cardMotion}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Top müəllimlər</p>
              <p className="text-xs text-muted">Son rəylərə görə</p>
            </div>
            <GraduationCap className="size-5 text-clay" />
          </div>

          <div className="mt-4 divide-y divide-line">
            {teacherRows.map(([name, course, rating]) => (
              <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-3" key={name}>
                <div>
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-xs text-muted">{course}</p>
                </div>
                <div className="flex h-8 items-center gap-1 rounded-lg border border-line bg-white px-2 text-sm font-semibold">
                  <Star className="size-3.5 fill-clay text-clay" />
                  {rating}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            className={`rounded-lg border border-white/70 bg-white/84 p-4 shadow-[0_14px_34px_rgba(39,35,29,0.06)] backdrop-blur-xl ${cardMotion}`}
            href="/courses"
          >
            <BookOpen className="size-5 text-sage" />
            <p className="mt-4 text-sm font-semibold">Kurs mərkəzi</p>
            <p className="mt-1 text-xs leading-5 text-muted">
              Rəy, forum və konspektlər kurs səhifələrində birləşəcək.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-sage">
              <Users className="size-4" />
              24 aktiv kurs
            </div>
          </Link>
          <Link
            className={`rounded-lg border border-white/70 bg-white/84 p-4 shadow-[0_14px_34px_rgba(39,35,29,0.06)] backdrop-blur-xl ${cardMotion}`}
            href="/swap"
          >
            <ShoppingBag className="size-5 text-[#8a6f45]" />
            <p className="mt-4 text-sm font-semibold">Swap bazarı</p>
            <p className="mt-1 text-xs leading-5 text-muted">
              Kitab, avadanlıq və kampus əşyaları üçün tələbə bazarı.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-[#8a6f45]">
              <FileText className="size-4" />
              12 yeni elan
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
