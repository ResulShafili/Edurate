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
      <header className="space-y-4 md:flex md:items-end md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-gray-900 md:text-3xl">
            Sual-cavab
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {sortedQuestions.length} aktiv sual • {totalAnswerCount} cavab
          </p>
        </div>

        <label className="relative block w-full md:w-[420px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            className="min-h-[48px] w-full rounded-2xl border border-gray-200 bg-slate-50 pl-11 pr-4 text-sm text-gray-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] outline-none transition focus:border-gray-400 focus:ring-0"
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
              className={`min-h-[44px] shrink-0 rounded-2xl px-4 text-xs font-semibold transition-all duration-200 md:hover:-translate-y-0.5 md:hover:shadow-md ${
                selectedCourseId === "all"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              }`}
              type="button"
              onClick={() => setSelectedCourseId("all")}
            >
              Bütün fənlər
            </button>
            {courses.map((course) => (
              <button
                className={`min-h-[44px] shrink-0 rounded-2xl px-4 text-xs font-semibold transition-all duration-200 md:hover:-translate-y-0.5 md:hover:shadow-md ${
                  selectedCourseId === course.id
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                }`}
                key={course.id}
                type="button"
                onClick={() => setSelectedCourseId(course.id)}
              >
                {course.code}
              </button>
            ))}
          </div>

          <div aria-busy={isLoading} className="grid gap-4">
            {isLoading ? <ContentSkeleton count={3} compact /> : sortedQuestions.map((question) => (
              <Link
                className="group rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-200 md:hover:-translate-y-1 md:hover:shadow-md"
                href={`/forum/${getQuestionSlug(question)}`}
                key={question.id}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-2xl bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700">
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

                <div className="mt-5 grid gap-3 sm:grid-cols-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MessageSquare className="size-3.5" />
                    {question.answerCount} cavab
                  </div>
                  <div className="flex min-h-[44px] items-center gap-2 rounded-2xl bg-red-50 px-4 text-xs text-red-600">
                    <ThumbsUp className="size-3.5" />
                    {question.voteScore} səs
                  </div>
                  <div className="flex min-h-[44px] items-center gap-2 rounded-2xl bg-slate-50 px-4 text-xs text-gray-500 sm:col-span-2">
                    <Clock3 className="size-3.5" />
                    {formatForumDate(question.lastActivityAt)} · {question.authorName}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {!isLoading && sortedQuestions.length === 0 && (
            <div className="rounded-3xl bg-white p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
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
