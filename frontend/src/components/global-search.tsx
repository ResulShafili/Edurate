"use client";

import {
  BookOpen,
  FileText,
  GraduationCap,
  LoaderCircle,
  MessageSquare,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  getQuestionSlug,
  mockCourses,
  mockQuestions,
} from "@/lib/forum";
import type { ForumCourse, ForumQuestionSummary } from "@/lib/forum";
import {
  getProfessorSlug,
  mockProfessors,
} from "@/lib/professors";
import type { ProfessorSummary } from "@/lib/professors";
import { mockResources } from "@/lib/resources";
import type { ResourceItem } from "@/lib/resources";

type SearchData = {
  professors: ProfessorSummary[];
  questions: ForumQuestionSummary[];
  resources: ResourceItem[];
  courses: ForumCourse[];
};

type SearchResult = {
  href: string;
  id: string;
  meta: string;
  title: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "";
const fallbackData: SearchData = {
  professors: mockProfessors,
  questions: mockQuestions,
  resources: mockResources,
  courses: mockCourses,
};

function includesQuery(values: Array<string | null | undefined>, query: string) {
  return values.join(" ").toLocaleLowerCase("az").includes(query);
}

export function GlobalSearch() {
  const desktopRootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [data, setData] = useState<SearchData>(fallbackData);
  const [isLoading, setIsLoading] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        desktopRootRef.current &&
        event.target instanceof Node &&
        !desktopRootRef.current.contains(event.target)
      ) {
        setIsDesktopOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (!isMobileOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileOpen]);

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (!apiBaseUrl || normalizedQuery.length < 2) {
      return undefined;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);

      try {
        const searchParam = encodeURIComponent(normalizedQuery);
        const [professorsResponse, questionsResponse, resourcesResponse, coursesResponse] =
          await Promise.all([
            fetch(`${apiBaseUrl}/api/professors?search=${searchParam}&limit=8`, {
              signal: controller.signal,
            }),
            fetch(`${apiBaseUrl}/api/questions?search=${searchParam}&limit=8`, {
              signal: controller.signal,
            }),
            fetch(`${apiBaseUrl}/api/resources?search=${searchParam}&limit=8`, {
              signal: controller.signal,
            }),
            fetch(`${apiBaseUrl}/api/courses`, { signal: controller.signal }),
          ]);

        if (
          !professorsResponse.ok ||
          !questionsResponse.ok ||
          !resourcesResponse.ok ||
          !coursesResponse.ok
        ) {
          throw new Error("Global search request failed");
        }

        const professorsPayload = (await professorsResponse.json()) as {
          professors?: ProfessorSummary[];
        };
        const questionsPayload = (await questionsResponse.json()) as {
          questions?: ForumQuestionSummary[];
        };
        const resourcesPayload = (await resourcesResponse.json()) as {
          resources?: ResourceItem[];
        };
        const coursesPayload = (await coursesResponse.json()) as { courses?: ForumCourse[] };

        setData({
          professors: professorsPayload.professors || [],
          questions: questionsPayload.questions || [],
          resources: resourcesPayload.resources || [],
          courses: coursesPayload.courses || [],
        });
      } catch {
        if (!controller.signal.aborted) {
          setData(fallbackData);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 220);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const groups = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("az");

    if (normalizedQuery.length < 2) {
      return [];
    }

    const professors: SearchResult[] = data.professors
      .filter((professor) =>
        includesQuery(
          [
            professor.fullName,
            professor.departmentName,
            ...professor.courses.flatMap((course) => [course.code, course.title]),
          ],
          normalizedQuery,
        ),
      )
      .slice(0, 3)
      .map((professor) => ({
        href: `/professors/${getProfessorSlug(professor)}`,
        id: professor.id,
        meta: `${professor.departmentName} · ${professor.averageRating.toFixed(1)}`,
        title: professor.fullName,
      }));

    const courses: SearchResult[] = data.courses
      .filter((course) =>
        includesQuery([course.code, course.title, course.departmentName], normalizedQuery),
      )
      .slice(0, 3)
      .map((course) => ({
        href: "/forum",
        id: course.id,
        meta: course.departmentName,
        title: `${course.code} · ${course.title}`,
      }));

    const questions: SearchResult[] = data.questions
      .filter((question) =>
        includesQuery(
          [question.title, question.body, question.courseCode, question.courseTitle],
          normalizedQuery,
        ),
      )
      .slice(0, 3)
      .map((question) => ({
        href: `/forum/${getQuestionSlug(question)}`,
        id: question.id,
        meta: `${question.courseCode} · ${question.answerCount} cavab`,
        title: question.title,
      }));

    const resources: SearchResult[] = data.resources
      .filter((resource) =>
        includesQuery(
          [resource.title, resource.fileName, resource.courseCode, resource.courseTitle],
          normalizedQuery,
        ),
      )
      .slice(0, 3)
      .map((resource) => ({
        href: "/resources",
        id: resource.id,
        meta: `${resource.courseCode} · ${resource.fileType.toLocaleUpperCase("az")}`,
        title: resource.title,
      }));

    return [
      { icon: GraduationCap, label: "Müəllimlər", results: professors },
      { icon: BookOpen, label: "Fənlər", results: courses },
      { icon: MessageSquare, label: "Forum", results: questions },
      { icon: FileText, label: "Materiallar", results: resources },
    ].filter((group) => group.results.length > 0);
  }, [data, query]);

  const hasQuery = query.trim().length >= 2;
  const showLoading = isLoading && hasQuery && Boolean(apiBaseUrl);

  const resultContent = (
    <div className="max-h-[min(62vh,520px)] overflow-y-auto p-2">
      {showLoading && (
        <div className="flex items-center gap-2 px-3 py-4 text-xs text-gray-400">
          <LoaderCircle className="size-4 animate-spin" />
          Nəticələr yenilənir
        </div>
      )}

      {!showLoading && !hasQuery && (
        <div className="px-3 py-6 text-center">
          <Search className="mx-auto size-5 text-gray-300" />
          <p className="mt-2 text-sm font-medium text-gray-700">Axtarmağa başla</p>
          <p className="mt-1 text-xs text-gray-400">Ən azı 2 simvol yaz.</p>
        </div>
      )}

      {!showLoading && hasQuery && groups.length === 0 && (
        <div className="px-3 py-6 text-center">
          <Search className="mx-auto size-5 text-gray-300" />
          <p className="mt-2 text-sm font-medium text-gray-700">Nəticə tapılmadı</p>
          <p className="mt-1 text-xs text-gray-400">Başqa açar sözlə yenidən yoxla.</p>
        </div>
      )}

      {groups.map((group) => {
        const Icon = group.icon;

        return (
          <section className="py-2" key={group.label}>
            <div className="flex items-center gap-2 px-3 pb-2 text-[11px] font-semibold uppercase tracking-normal text-gray-400">
              <Icon className="size-3.5" />
              {group.label}
            </div>
            <div className="space-y-1">
              {group.results.map((result) => (
                <Link
                  className="block rounded-2xl px-3 py-3 transition hover:bg-[#eff8f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:hover:bg-teal-500/10"
                  href={result.href}
                  key={`${group.label}-${result.id}`}
                  onClick={() => {
                    setIsDesktopOpen(false);
                    setIsMobileOpen(false);
                  }}
                >
                  <span className="block text-sm font-medium leading-5 text-gray-900">
                    {result.title}
                  </span>
                  <span className="mt-1 block text-xs text-gray-400">{result.meta}</span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );

  return (
    <>
      <button
        aria-label="Qlobal axtarışı aç"
        className="app-card flex size-11 shrink-0 items-center justify-center rounded-2xl text-gray-500 transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 md:hidden"
        type="button"
        onClick={() => setIsMobileOpen(true)}
      >
        <Search className="size-4" />
      </button>

      <div className="relative hidden md:block" ref={desktopRootRef}>
        <label className="relative block w-[min(32vw,470px)]">
          <span className="sr-only">Bütün platformada axtar</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            className="app-card min-h-[46px] w-full rounded-2xl bg-white pl-11 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#80bcae] focus:ring-0"
            placeholder="Müəllim, fənn, sual və material axtar"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsDesktopOpen(true);
            }}
            onFocus={() => setIsDesktopOpen(true)}
          />
        </label>

        {isDesktopOpen && (
          <div className="app-surface absolute left-0 top-[calc(100%+10px)] z-50 w-[520px] max-w-[calc(100vw-2rem)] rounded-3xl">
            {resultContent}
          </div>
        )}
      </div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-[70] bg-[#f4f7f6] p-4 dark:bg-[#0b1118] md:hidden">
          <div className="mx-auto max-w-xl">
            <div className="flex items-center gap-3">
              <label className="relative min-w-0 flex-1">
                <span className="sr-only">Bütün platformada axtar</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <input
                  autoFocus
                  className="app-card min-h-[50px] w-full rounded-2xl bg-white pl-11 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#80bcae] focus:ring-0"
                  placeholder="Bütün platformada axtar"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <button
                aria-label="Axtarışı bağla"
                className="app-card flex size-12 shrink-0 items-center justify-center rounded-2xl text-gray-500"
                type="button"
                onClick={() => setIsMobileOpen(false)}
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="app-surface mt-4 rounded-3xl">
              {resultContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
