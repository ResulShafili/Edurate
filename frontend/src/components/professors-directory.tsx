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
    <div className="space-y-4">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Modul B · Rate
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
            Müəllim və dərs rəyləri
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Müəllimləri və fənləri axtar, ümumi reytinqə bax və tələbə rəylərini oxu.
          </p>
        </div>

        <label className="relative block w-full lg:w-[380px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            className="h-11 w-full rounded-lg border border-line bg-white/82 pl-9 pr-3 text-sm shadow-[0_10px_28px_rgba(31,28,24,0.06)] outline-none backdrop-blur-md transition focus:border-sage"
            placeholder="Müəllim və ya fənn axtar"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filteredProfessors.map((professor) => (
          <Link
            className="group flex min-h-[220px] flex-col justify-between rounded-lg border border-white/70 bg-white/84 p-4 shadow-[0_14px_34px_rgba(39,35,29,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            href={`/professors/${professor.id}`}
            key={professor.id}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold leading-6">{professor.fullName}</p>
                  <p className="mt-1 text-xs text-muted">{professor.title}</p>
                </div>
                <div className="flex h-9 items-center gap-1 rounded-lg border border-line bg-white px-2 text-sm font-semibold">
                  <Star className="size-3.5 fill-clay text-clay" />
                  {formatRating(professor.averageRating)}
                </div>
              </div>

              <p className="mt-3 text-sm text-muted">{professor.departmentName}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {professor.courses.slice(0, 3).map((course) => (
                  <span
                    className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-medium text-muted"
                    key={course.id}
                  >
                    {course.code}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-[#f7f5f0] p-3">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Users className="size-3.5" />
                  Rəy
                </div>
                <p className="mt-1 text-lg font-semibold">{professor.reviewCount}</p>
              </div>
              <div className="rounded-lg bg-[#eef6f1] p-3">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <BookOpen className="size-3.5" />
                  Çətinlik
                </div>
                <p className="mt-1 text-lg font-semibold">
                  {formatRating(professor.averageDifficulty)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </section>

      {filteredProfessors.length === 0 && (
        <div className="rounded-lg border border-white/70 bg-white/84 p-8 text-center shadow-[0_14px_34px_rgba(39,35,29,0.06)] backdrop-blur-xl">
          <p className="text-sm font-semibold">Nəticə tapılmadı</p>
          <p className="mt-1 text-sm text-muted">Başqa müəllim və ya fənn adı ilə axtar.</p>
        </div>
      )}

      {isLoading && (
        <p className="text-center text-xs font-medium text-muted">Yenilənir...</p>
      )}
    </div>
  );
}
