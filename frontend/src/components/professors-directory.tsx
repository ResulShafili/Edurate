"use client";

import { BookOpen, GraduationCap, Search, Star, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ContentSkeleton } from "@/components/content-skeleton";
import {
  apiBaseUrl,
  formatRating,
  getProfessorSlug,
  mockProfessors,
} from "@/lib/professors";
import type { ProfessorSummary } from "@/lib/professors";

type ProfessorsResponse = {
  professors?: ProfessorSummary[];
};

const professorTones = [
  {
    accent: "bg-[#ed7650]",
    avatar: "bg-[#fff0e6] text-[#d75a34] dark:bg-orange-500/10 dark:text-orange-300",
  },
  {
    accent: "bg-[#35a58c]",
    avatar: "bg-[#dff4ec] text-[#0e7a65] dark:bg-teal-500/10 dark:text-teal-300",
  },
  {
    accent: "bg-[#6e9fe0]",
    avatar: "bg-[#e9f1ff] text-[#3e6fb1] dark:bg-blue-500/10 dark:text-blue-300",
  },
] as const;

function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

export function ProfessorsDirectory() {
  const [search, setSearch] = useState("");
  const [professors, setProfessors] = useState<ProfessorSummary[]>(mockProfessors);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfessors() {
      if (!apiBaseUrl) {
        setProfessors(mockProfessors);
        return;
      }

      setIsLoading(true);

      try {
        const params = new URLSearchParams();

        if (search.trim()) {
          params.set("search", search.trim());
        }

        const response = await fetch(`${apiBaseUrl}/api/professors?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Professor list request failed");
        }

        const data = (await response.json()) as ProfessorsResponse;
        setProfessors(data.professors?.length ? data.professors : mockProfessors);
      } catch {
        if (!controller.signal.aborted) {
          setProfessors(mockProfessors);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    const timer = window.setTimeout(loadProfessors, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [search]);

  const filteredProfessors = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return professors;
    }

    return professors.filter((professor) => {
      const courseText = professor.courses
        .map((course) => `${course.code} ${course.title}`)
        .join(" ");

      return `${professor.fullName} ${professor.departmentName} ${courseText}`
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [professors, search]);

  return (
    <div className="space-y-6">
      <header className="space-y-4 lg:flex lg:items-end lg:justify-between lg:space-y-0">
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff0e6] text-[#d75a34] dark:bg-orange-500/10 dark:text-orange-300">
            <GraduationCap className="size-5" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">Kampus təcrübəsi</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-normal text-gray-900 md:text-3xl">
              Müəllim qiymətləndirmələri
            </h1>
            <p className="mt-1 text-xs text-gray-500">{filteredProfessors.length} müəllim · strukturlaşdırılmış nəticələr</p>
          </div>
        </div>

        <label className="relative block w-full max-w-full md:w-[380px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            className="app-card min-h-[50px] w-full rounded-2xl bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#80bcae] focus:ring-0"
            placeholder="Bu bölmədə müəllim və ya fənn axtar"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </header>

      <section aria-busy={isLoading} className="stagger-grid grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {isLoading ? <ContentSkeleton count={6} compact /> : filteredProfessors.map((professor, professorIndex) => {
          const tone = professorTones[professorIndex % professorTones.length];
          return (
          <article
            className="app-card interactive-lift group relative flex min-h-[218px] flex-col justify-between overflow-hidden rounded-[1.65rem] p-5"
            key={professor.id}
          >
            <Link
              aria-label={`${professor.fullName} profilinə bax`}
              className="absolute inset-0 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
              href={`/professors/${getProfessorSlug(professor)}`}
            />
            <div className="pointer-events-none relative">
              <span className={`absolute -top-5 left-0 h-1 w-16 rounded-b-full ${tone.accent}`} />
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold ${tone.avatar}`}>
                    {getInitials(professor.fullName)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold leading-6 text-gray-900">{professor.fullName}</p>
                    <p className="mt-0.5 truncate text-xs text-gray-400">{professor.title}</p>
                  </div>
                </div>
                <div className="flex min-h-[40px] shrink-0 items-center gap-1 rounded-full bg-[#fff6cf] px-3 text-sm font-semibold text-[#745900] dark:bg-yellow-500/10 dark:text-yellow-200">
                  <Star className="size-4 fill-orange-500 text-orange-500" />
                  {formatRating(professor.averageRating)}
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-600">{professor.departmentName}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {professor.courses.slice(0, 3).map((course) => (
                  <span
                    className="rounded-full border border-[#e4ebe8] bg-[#f7f9f8] px-3 py-1.5 text-[11px] font-medium text-gray-600 dark:border-white/10 dark:bg-white/5"
                    key={course.id}
                  >
                    {course.code}
                  </span>
                ))}
              </div>
            </div>

            <div className="pointer-events-none relative mt-5 flex items-center gap-5 border-t border-[#edf1ef] pt-4 dark:border-white/10">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Users className="size-3.5" />
                  <span><strong className="font-semibold text-gray-900">{professor.reviewCount}</strong> qiymət</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#0e7a65] dark:text-teal-300">
                  <BookOpen className="size-3.5" />
                  <span>Dərs balansı <strong className="font-semibold">{formatRating(professor.averageCourseBalance)}</strong></span>
              </div>
            </div>
          </article>
          );
        })}
      </section>

      {!isLoading && filteredProfessors.length === 0 && (
        <div className="app-card rounded-3xl p-8 text-center">
          <GraduationCap className="mx-auto size-7 text-teal-700" />
          <p className="mt-3 text-sm font-semibold text-gray-900">Nəticə tapılmadı</p>
          <p className="mt-1 text-sm text-gray-500">Başqa müəllim və ya fənn adı ilə axtar.</p>
          <button
            className="mx-auto mt-5 flex min-h-[44px] items-center justify-center rounded-2xl bg-gray-900 px-5 text-sm font-semibold text-white"
            type="button"
            onClick={() => setSearch("")}
          >
            Axtarışı təmizlə
          </button>
        </div>
      )}

    </div>
  );
}
