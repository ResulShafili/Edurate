"use client";

import { BookOpen, Search, Star, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  apiBaseUrl,
  formatRating,
  mockProfessors,
} from "@/lib/professors";
import type { ProfessorSummary } from "@/lib/professors";

type ProfessorsResponse = {
  professors?: ProfessorSummary[];
};

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
      <header className="space-y-4 md:flex md:items-end md:justify-between md:space-y-0">
        <div>
          <p className="hidden text-xs font-medium uppercase tracking-[0.16em] text-gray-400 md:block">
            Modul B · Rate
          </p>
          <h1 className="text-2xl font-semibold tracking-normal text-gray-900 md:mt-1 md:text-3xl">
            Müəllim rəyləri
          </h1>
          <p className="mt-2 hidden max-w-2xl text-sm leading-6 text-gray-600 md:block">
            Müəllimləri və fənləri axtar, ümumi reytinqə bax və tələbə rəylərini oxu.
          </p>
        </div>

        <label className="relative block w-full md:w-[380px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            className="min-h-[48px] w-full rounded-2xl border border-gray-200 bg-slate-50 pl-11 pr-4 text-sm text-gray-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] outline-none transition focus:border-gray-400 focus:ring-0"
            placeholder="Müəllim və ya fənn axtar"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProfessors.map((professor) => (
          <Link
            className="group flex min-h-[220px] flex-col justify-between rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 md:hover:-translate-y-1 md:hover:shadow-md"
            href={`/professors/${professor.id}`}
            key={professor.id}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold leading-6 text-gray-900">{professor.fullName}</p>
                  <p className="mt-1 text-xs text-gray-400">{professor.title}</p>
                </div>
                <div className="flex min-h-[44px] items-center gap-1 rounded-2xl bg-slate-50 px-3 text-sm font-semibold text-gray-900">
                  <Star className="size-4 fill-orange-500 text-orange-500" />
                  {formatRating(professor.averageRating)}
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-600">{professor.departmentName}</p>
              <div className="mt-4 flex flex-wrap gap-2 md:gap-3">
                {professor.courses.slice(0, 3).map((course) => (
                  <span
                    className="rounded-2xl bg-slate-50 px-3 py-2 text-xs font-medium text-gray-600"
                    key={course.id}
                  >
                    {course.code}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Users className="size-3.5" />
                  Rəy
                </div>
                <p className="mt-1 text-lg font-semibold text-gray-900">{professor.reviewCount}</p>
              </div>
              <div className="rounded-2xl bg-teal-50 p-4">
                <div className="flex items-center gap-2 text-xs text-teal-700">
                  <BookOpen className="size-3.5" />
                  Çətinlik
                </div>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {formatRating(professor.averageDifficulty)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </section>

      {filteredProfessors.length === 0 && (
        <div className="rounded-3xl bg-white p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <p className="text-sm font-semibold text-gray-900">Nəticə tapılmadı</p>
          <p className="mt-1 text-sm text-gray-500">Başqa müəllim və ya fənn adı ilə axtar.</p>
        </div>
      )}

      {isLoading && (
        <p className="text-center text-xs font-medium text-gray-400">Yenilənir...</p>
      )}
    </div>
  );
}
