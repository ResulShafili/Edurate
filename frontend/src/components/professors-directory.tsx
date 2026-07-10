"use client";

import { BookOpen, Check, GraduationCap, Scale, Search, Star, Users, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ProfessorCompareDialog } from "@/components/professor-compare-dialog";
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

export function ProfessorsDirectory() {
  const [search, setSearch] = useState("");
  const [professors, setProfessors] = useState<ProfessorSummary[]>(mockProfessors);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProfessorIds, setSelectedProfessorIds] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

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

  const selectedProfessors = useMemo(
    () =>
      selectedProfessorIds
        .map((id) => professors.find((professor) => professor.id === id))
        .filter((professor): professor is ProfessorSummary => Boolean(professor)),
    [professors, selectedProfessorIds],
  );

  function toggleProfessorSelection(professorId: string) {
    setSelectedProfessorIds((currentIds) => {
      if (currentIds.includes(professorId)) {
        return currentIds.filter((id) => id !== professorId);
      }

      return currentIds.length < 3 ? [...currentIds, professorId] : currentIds;
    });
  }

  return (
    <div className="space-y-6">
      <header className="space-y-4 md:flex md:items-end md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-gray-900 md:text-3xl">
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
            placeholder="Bu bölmədə müəllim və ya fənn axtar"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </header>

      <section aria-busy={isLoading} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? <ContentSkeleton count={6} compact /> : filteredProfessors.map((professor) => {
          const isSelected = selectedProfessorIds.includes(professor.id);
          const selectionLimitReached = selectedProfessorIds.length >= 3 && !isSelected;

          return (
          <article
            className="group relative flex min-h-[250px] flex-col justify-between rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-200 md:hover:-translate-y-1 md:hover:shadow-md"
            key={professor.id}
          >
            <Link
              aria-label={`${professor.fullName} profilinə bax`}
              className="absolute inset-0 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
              href={`/professors/${getProfessorSlug(professor)}`}
            />
            <div className="pointer-events-none relative">
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

            <div className="pointer-events-none relative mt-5 grid grid-cols-2 gap-3">
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

            <button
              aria-pressed={isSelected}
              className={`relative z-10 mt-4 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border px-4 text-xs font-semibold transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 disabled:cursor-not-allowed disabled:opacity-45 ${
                isSelected
                  ? "border-teal-200 bg-teal-50 text-teal-700"
                  : "border-slate-200 bg-white text-gray-600 hover:bg-slate-50"
              }`}
              disabled={selectionLimitReached}
              title={selectionLimitReached ? "Maksimum 3 müəllim seçilə bilər" : undefined}
              type="button"
              onClick={() => toggleProfessorSelection(professor.id)}
            >
              {isSelected ? <Check className="size-4" /> : <Scale className="size-4" />}
              {isSelected ? "Müqayisəyə əlavə edildi" : "Müqayisə et"}
            </button>
          </article>
          );
        })}
      </section>

      {!isLoading && filteredProfessors.length === 0 && (
        <div className="rounded-3xl bg-white p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
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

      {selectedProfessors.length >= 2 && (
        <div className="fixed inset-x-4 bottom-20 z-50 md:bottom-6 md:left-[280px] md:right-8">
          <div className="mx-auto flex max-w-xl items-center gap-3 rounded-3xl border border-white/70 bg-gray-900 p-3 text-white shadow-[0_8px_30px_rgb(0,0,0,0.14)]">
            <div className="min-w-0 flex-1 px-2">
              <p className="text-sm font-semibold">{selectedProfessors.length} müəllim seçildi</p>
              <p className="mt-0.5 hidden truncate text-xs text-gray-400 sm:block">
                {selectedProfessors.map((professor) => professor.fullName).join(" · ")}
              </p>
            </div>
            <button
              aria-label="Seçimi təmizlə"
              className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-gray-300 transition active:scale-95 hover:bg-white/15 hover:text-white"
              type="button"
              onClick={() => setSelectedProfessorIds([])}
            >
              <X className="size-4" />
            </button>
            <button
              className="flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-xs font-semibold text-gray-900 transition active:scale-[0.98]"
              type="button"
              onClick={() => setIsCompareOpen(true)}
            >
              <Scale className="size-4" />
              Müqayisə et
            </button>
          </div>
        </div>
      )}

      <ProfessorCompareDialog
        isOpen={isCompareOpen}
        professors={selectedProfessors}
        onClose={() => setIsCompareOpen(false)}
      />
    </div>
  );
}
