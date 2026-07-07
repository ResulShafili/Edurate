"use client";

import {
  BookOpen,
  ChevronRight,
  Clock3,
  MessageSquare,
  Search,
  Sparkles,
  ThumbsUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { QuestionForm } from "@/components/question-form";
import {
  formatForumDate,
  forumApiBaseUrl,
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

  function handleQuestionCreated(question: ForumQuestionSummary) {
    setQuestions((currentQuestions) => [question, ...currentQuestions]);
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Modul C · Q&A
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
            Fənn sual-cavab forumu
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Fənn seç, mövzunu axtar və tələbələrin ən faydalı cavablarını yuxarıda gör.
          </p>
        </div>

        <label className="relative block w-full lg:w-[420px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            className="h-11 w-full rounded-lg border border-line bg-white/82 pl-9 pr-3 text-sm shadow-[0_10px_28px_rgba(31,28,24,0.06)] outline-none backdrop-blur-md transition focus:border-sage"
            placeholder="Sual, fənn və ya mövzu axtar"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </header>

      <section className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              className={`h-9 shrink-0 rounded-lg border px-3 text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-md ${
                selectedCourseId === "all"
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white/84 text-muted"
              }`}
              type="button"
              onClick={() => setSelectedCourseId("all")}
            >
              Bütün fənlər
            </button>
            {courses.map((course) => (
              <button
                className={`h-9 shrink-0 rounded-lg border px-3 text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-md ${
                  selectedCourseId === course.id
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-white/84 text-muted"
                }`}
                key={course.id}
                type="button"
                onClick={() => setSelectedCourseId(course.id)}
              >
                {course.code}
              </button>
            ))}
          </div>

          <div className="grid gap-3">
            {sortedQuestions.map((question) => (
              <Link
                className="group rounded-lg border border-white/70 bg-white/84 p-4 shadow-[0_14px_34px_rgba(39,35,29,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                href={`/questions/${question.id}`}
                key={question.id}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-[#eef6f1] px-2 py-1 text-xs font-semibold text-sage">
                        {question.courseCode}
                      </span>
                      <span className="text-xs text-muted">{question.courseTitle}</span>
                    </div>
                    <h2 className="mt-3 text-base font-semibold leading-6 text-foreground">
                      {question.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                      {question.body}
                    </p>
                  </div>

                  <ChevronRight className="hidden size-5 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-foreground sm:block" />
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-4">
                  <div className="flex items-center gap-2 rounded-lg bg-[#f7f5f0] px-3 py-2 text-xs text-muted">
                    <MessageSquare className="size-3.5" />
                    {question.answerCount} cavab
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-[#fff4ef] px-3 py-2 text-xs text-clay">
                    <ThumbsUp className="size-3.5" />
                    {question.voteScore} səs
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs text-muted sm:col-span-2">
                    <Clock3 className="size-3.5" />
                    {formatForumDate(question.lastActivityAt)} · {question.authorName}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {sortedQuestions.length === 0 && (
            <div className="rounded-lg border border-white/70 bg-white/84 p-8 text-center shadow-[0_14px_34px_rgba(39,35,29,0.06)] backdrop-blur-xl">
              <MessageSquare className="mx-auto size-6 text-sage" />
              <p className="mt-3 text-sm font-semibold">Sual tapılmadı</p>
              <p className="mt-1 text-sm text-muted">Başqa fənn və ya mövzu adı ilə axtar.</p>
            </div>
          )}

          {isLoading && (
            <p className="text-center text-xs font-medium text-muted">Yenilənir...</p>
          )}
        </div>

        <aside className="space-y-3">
          <div className="rounded-lg border border-white/70 bg-white/84 p-4 shadow-[0_14px_34px_rgba(39,35,29,0.06)] backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="size-4 text-clay" />
              Forum ritmi
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-line bg-white p-3">
                <p className="text-2xl font-semibold">{sortedQuestions.length}</p>
                <p className="text-xs text-muted">Aktiv sual</p>
              </div>
              <div className="rounded-lg border border-line bg-white p-3">
                <p className="text-2xl font-semibold">
                  {sortedQuestions.reduce((total, question) => total + question.answerCount, 0)}
                </p>
                <p className="text-xs text-muted">Cavab</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#eef6f1] px-3 py-2 text-xs font-medium text-sage">
              <BookOpen className="size-3.5" />
              Ən çox səs alan cavablar thread-də yuxarı qalxır.
            </div>
          </div>

          <QuestionForm courses={courses} onQuestionCreated={handleQuestionCreated} />
        </aside>
      </section>
    </div>
  );
}
