import {
  ArrowRight,
  BookOpen,
  FileText,
  GraduationCap,
  MessageSquare,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";

import { UserActions } from "@/components/user-actions";

const modules = [
  {
    title: "Müəllim rəyləri",
    subtitle: "128 aktiv rəy",
    href: "/professors",
    icon: Star,
    tone: "bg-orange-50 text-orange-600",
  },
  {
    title: "Sual-cavab",
    subtitle: "42 açıq sual",
    href: "/forum",
    icon: MessageSquare,
    tone: "bg-teal-50 text-teal-700",
  },
  {
    title: "PDF materiallar",
    subtitle: "316 fayl",
    href: "/resources",
    icon: FileText,
    tone: "bg-slate-100 text-slate-600",
  },
  {
    title: "Kampus swap",
    subtitle: "58 elan",
    href: "/swap",
    icon: ShoppingBag,
    tone: "bg-blue-50 text-blue-600",
  },
];

const teacherRows = [
  ["Nigar Mammadova", "Algorithms", "4.8"],
  ["Elvin Huseynli", "Databases", "4.6"],
  ["Aysel Karimova", "Web Stack", "4.5"],
];

const pulseStats = [
  ["544", "tələbə"],
  ["4.7", "orta rəy"],
  ["316", "material"],
  ["58", "elan"],
];

const cardMotion = "transition-all duration-300 md:hover:-translate-y-1 md:hover:shadow-md";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-4 md:flex md:items-center md:justify-between md:space-y-0">
        <div>
          <p className="hidden text-xs font-medium uppercase tracking-[0.16em] text-gray-400 md:block">
            EduRate Kampus
          </p>
          <h1 className="text-2xl font-semibold tracking-normal text-gray-900 md:mt-1 md:text-3xl">
            EduRate
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 md:text-gray-600">
            Qarabağ Universiteti tələbələri üçün sakit, sürətli və faydalı kampus paneli.
          </p>
        </div>

        <div className="space-y-3 md:flex md:items-center md:gap-3 md:space-y-0">
          <label className="relative block w-full md:w-[340px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              className="min-h-[48px] w-full rounded-2xl border border-gray-200 bg-slate-50 pl-11 pr-4 text-sm text-gray-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] outline-none transition focus:border-gray-400 focus:ring-0"
              placeholder="Müəllim, kurs, konspekt axtar"
              type="search"
            />
          </label>
          <UserActions />
        </div>
      </header>

      <section className="rounded-[2rem] bg-gray-900 p-4 text-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] md:p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_330px] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gray-200">
              <ShieldCheck className="size-3.5 text-teal-300" />
              Universitet emaili ilə qorunur
            </div>
            <h2 className="mt-4 max-w-2xl text-xl font-semibold leading-tight md:text-4xl">
              Kampusdakı lazım olan şeylər bir yerdə.
            </h2>
            <p className="mt-3 hidden max-w-2xl text-sm leading-6 text-gray-300 sm:block">
              Rəy oxu, sual ver, konspekt tap və kampus elanlarına bax. Hamısı tələbə ritminə uyğun yığcam paneldə.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <Link
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
                href="/professors"
              >
                Müəllim tap
                <ArrowRight className="size-4" />
              </Link>
              <Link
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15"
                href="/swap"
              >
                Elanlara bax
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          <div className="hidden grid-cols-4 gap-2 sm:grid lg:grid-cols-2">
            {pulseStats.map(([value, label]) => (
              <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10 md:p-4" key={label}>
                <p className="text-lg font-semibold leading-6 md:text-2xl">{value}</p>
                <p className="mt-1 text-[11px] text-gray-300 md:text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {modules.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              className={`group flex min-h-[112px] flex-col justify-between rounded-3xl bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.035)] md:min-h-[132px] md:p-5 ${cardMotion}`}
              href={item.href}
              key={item.title}
            >
              <span className={`flex size-10 items-center justify-center rounded-2xl md:size-12 ${item.tone}`}>
                <Icon className="size-4 md:size-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold leading-5 text-gray-900 md:text-base">
                  {item.title}
                </span>
                <span className="mt-1 block text-xs text-gray-400 md:text-sm">{item.subtitle}</span>
              </span>
            </Link>
          );
        })}
      </section>

      <section className="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-[0.95fr_1.05fr]">
        <div className={`rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${cardMotion}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold text-gray-900">Top müəllimlər</p>
              <p className="hidden text-sm text-gray-400 md:block">Son rəylərə görə</p>
            </div>
            <GraduationCap className="size-5 text-orange-600" />
          </div>

          <div className="mt-5 divide-y divide-slate-100">
            {teacherRows.map(([name, course, rating]) => (
              <div className="grid grid-cols-[1fr_auto] items-center gap-4 py-4" key={name}>
                <div>
                  <p className="text-sm font-medium text-gray-900">{name}</p>
                  <p className="mt-1 text-xs text-gray-400">{course}</p>
                </div>
                <div className="flex min-h-[44px] items-center gap-1 rounded-2xl bg-slate-50 px-3 text-sm font-semibold text-gray-900">
                  <Star className="size-4 fill-orange-500 text-orange-500" />
                  {rating}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Link
            className={`rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${cardMotion}`}
            href="/professors"
          >
            <BookOpen className="size-6 text-teal-700" />
            <p className="mt-5 text-base font-semibold text-gray-900">Kurs mərkəzi</p>
            <p className="mt-2 hidden text-sm leading-6 text-gray-600 md:block">
              Rəy, forum və konspektləri kurslar ətrafında tap.
            </p>
            <div className="mt-5 flex items-center gap-2 text-sm font-medium text-teal-700">
              <Users className="size-4" />
              24 aktiv kurs
            </div>
          </Link>

          <Link
            className={`rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${cardMotion}`}
            href="/swap"
          >
            <ShoppingBag className="size-6 text-blue-600" />
            <p className="mt-5 text-base font-semibold text-gray-900">Swap bazarı</p>
            <p className="mt-2 hidden text-sm leading-6 text-gray-600 md:block">
              Kitab, avadanlıq və kampus əşyaları üçün tələbə elanları.
            </p>
            <div className="mt-5 flex items-center gap-2 text-sm font-medium text-blue-600">
              <FileText className="size-4" />
              12 yeni elan
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
