"use client";

import {
  ChevronRight,
  Clock3,
  MessageSquare,
  Search,
  ThumbsUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { QuestionForm } from "@/components/question-form";
import { ContentSkeleton } from "@/components/content-skeleton";
import {
  formatForumDate,
  forumApiBaseUrl,
  getQuestionSlug,
  mockCourses,
  mockQuestions,
} from "@/lib/forum";
import type {
  ForumCourse,
  ForumQuestionSummary,
} from "@/lib/forum";

type QuestionsResponse = {
  questions?: ForumQuestionSummary[];
};

type CoursesResponse = {
  courses?: ForumCourse[];
};

function searchQuestions(questions: ForumQuestionSummary[], search: string) {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return questions;
  }

  return questions.filter((question) =>
    `${question.title} ${question.body} ${question.courseCode} ${question.courseTitle}`
      .toLowerCase()
      .includes(normalizedSearch),
  );
}

export function ForumBoard() {
  const [search, setSearch] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("all");
  const [questions, setQuestions] = useState<ForumQuestionSummary[]>(mockQuestions);
  const [courses, setCourses] = useState<ForumCourse[]>(mockCourses);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCourses() {
      if (!forumApiBaseUrl) {
        setCourses(mockCourses);
        return;
      }

      try {
        const response = await fetch(`${forumApiBaseUrl}/api/courses`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Course list request failed");
        }

        const data = (await response.json()) as CoursesResponse;
        setCourses(data.courses?.length ? data.courses : mockCourses);
      } catch {
        if (!controller.signal.aborted) {
          setCourses(mockCourses);
        }
      }
    }

    loadCourses();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadQuestions() {
      if (!forumApiBaseUrl) {
        const filteredByCourse =
          selectedCourseId === "all"
            ? mockQuestions
            : mockQuestions.filter((question) => question.courseId === selectedCourseId);

        setQuestions(searchQuestions(filteredByCourse, search));
        return;
      }

      setIsLoading(true);

      try {
        const params = new URLSearchParams();

        if (search.trim()) {
          params.set("search", search.trim());
        }

        const endpoint =
          selectedCourseId === "all"
            ? `${forumApiBaseUrl}/api/questions?${params.toString()}`
            : `${forumApiBaseUrl}/api/courses/${selectedCourseId}/questions?${params.toString()}`;

        const response = await fetch(endpoint, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Question list request failed");
        }

        const data = (await response.json()) as QuestionsResponse;
        setQuestions(data.questions || []);
      } catch {
        if (!controller.signal.aborted) {
          const filteredByCourse =
            selectedCourseId === "all"
              ? mockQuestions
              : mockQuestions.filter((question) => question.courseId === selectedCourseId);

          setQuestions(searchQuestions(filteredByCourse, search));
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    const timer = window.setTimeout(loadQuestions, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [search, selectedCourseId]);

  const sortedQuestions = useMemo(
    () =>
      [...questions].sort((first, second) => {
        const activityDiff =
          new Date(second.lastActivityAt).getTime() - new Date(first.lastActivityAt).getTime();

        if (activityDiff !== 0) {
          return activityDiff;
        }

        return second.voteScore - first.voteScore;
      }),
    [questions],
  );
  const totalAnswerCount = sortedQuestions.reduce(
    (total, question) => total + question.answerCount,
    0,
  );

  function handleQuestionCreated(question: ForumQuestionSummary) {
    setQuestions((currentQuestions) => [question, ...currentQuestions]);
  }

  return (
    <div className="space-y-6">
      <header className="space-y-4 lg:flex lg:items-end lg:justify-between lg:space-y-0">
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#dff4ec] text-[#0e7a65] dark:bg-teal-500/10 dark:text-teal-300">
            <MessageSquare className="size-5" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">Birlikdə öyrən</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-normal text-gray-900 md:text-3xl">
              Sual-cavab
            </h1>
            <p className="mt-1 text-xs text-gray-500">
              {sortedQuestions.length} aktiv sual • {totalAnswerCount} cavab
            </p>
          </div>
        </div>

        <label className="relative block w-full max-w-full md:w-[420px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            className="app-card min-h-[50px] w-full rounded-2xl bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#80bcae] focus:ring-0"
            placeholder="Bu bölmədə sual və ya mövzu axtar"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </header>

      <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-4">
          <div className="scrollbar-none flex gap-3 overflow-x-auto pb-1">
            <button
              className={`min-h-[44px] shrink-0 rounded-full border px-4 text-xs font-semibold transition-all duration-200 ${
                selectedCourseId === "all"
                  ? "border-[#9dd1c4] bg-[#e7f5f0] text-[#0e705e] dark:bg-teal-500/10 dark:text-teal-300"
                  : "border-[#e1e9e6] bg-white text-gray-600 hover:border-[#bcd8d0]"
              }`}
              type="button"
              onClick={() => setSelectedCourseId("all")}
            >
              Bütün fənlər
            </button>
            {courses.map((course) => (
              <button
                className={`min-h-[44px] shrink-0 rounded-full border px-4 text-xs font-semibold transition-all duration-200 ${
                  selectedCourseId === course.id
                    ? "border-[#9dd1c4] bg-[#e7f5f0] text-[#0e705e] dark:bg-teal-500/10 dark:text-teal-300"
                    : "border-[#e1e9e6] bg-white text-gray-600 hover:border-[#bcd8d0]"
                }`}
                key={course.id}
                type="button"
                onClick={() => setSelectedCourseId(course.id)}
              >
                {course.code}
              </button>
            ))}
          </div>

          <div aria-busy={isLoading} className="stagger-grid grid gap-4">
            {isLoading ? <ContentSkeleton count={3} compact /> : sortedQuestions.map((question) => (
              <Link
                className="app-card interactive-lift group relative overflow-hidden rounded-[1.65rem] p-5"
                href={`/forum/${getQuestionSlug(question)}`}
                key={question.id}
              >
                <span className="absolute inset-y-5 left-0 w-1 rounded-r-full bg-[#35a58c]" />
                <div className="flex flex-col gap-4 pl-1 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#dff4ec] px-2.5 py-1.5 text-[11px] font-semibold text-[#0e7a65] dark:bg-teal-500/10 dark:text-teal-300">
                        {question.courseCode}
                      </span>
                      <span className="text-xs text-gray-400">{question.courseTitle}</span>
                    </div>
                    <h2 className="mt-4 text-base font-semibold leading-6 text-gray-900">
                      {question.title}
                    </h2>
                    <p className="mt-2 hidden line-clamp-2 text-sm leading-6 text-gray-600 md:block">
                      {question.body}
                    </p>
                  </div>

                  <ChevronRight className="hidden size-5 shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-gray-900 sm:block" />
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-[#edf1ef] pt-4 dark:border-white/10">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MessageSquare className="size-3.5" />
                    {question.answerCount} cavab
                  </div>
                  <div className="flex min-h-[36px] items-center gap-2 rounded-full bg-[#fff0e6] px-3 text-xs font-semibold text-[#c55432] dark:bg-orange-500/10 dark:text-orange-300">
                    <ThumbsUp className="size-3.5" />
                    {question.voteScore} səs
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 sm:ml-auto">
                    <Clock3 className="size-3.5" />
                    {formatForumDate(question.lastActivityAt)} · {question.authorName}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {!isLoading && sortedQuestions.length === 0 && (
            <div className="app-card rounded-3xl p-8 text-center">
              <MessageSquare className="mx-auto size-6 text-teal-700" />
              <p className="mt-3 text-sm font-semibold text-gray-900">Sual tapılmadı</p>
              <p className="mt-1 text-sm text-gray-500">Başqa fənn və ya mövzu adı ilə axtar.</p>
              <button
                className="mx-auto mt-5 flex min-h-[44px] items-center justify-center rounded-2xl bg-gray-900 px-5 text-sm font-semibold text-white"
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCourseId("all");
                  document.getElementById("question-form")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                İlk sualı sən ver
              </button>
            </div>
          )}
        </div>

        <aside className="min-w-0 space-y-4">
          <QuestionForm courses={courses} onQuestionCreated={handleQuestionCreated} />
        </aside>
      </section>
    </div>
  );
}
