"use client";

import { ArrowLeft, BookOpen, GraduationCap, MessageSquare, Star, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ReviewForm } from "@/components/review-form";
import {
  apiBaseUrl,
  findMockProfessor,
  formatRating,
} from "@/lib/professors";
import type {
  ProfessorProfile as ProfessorProfileType,
  ReviewSummary,
} from "@/lib/professors";

type ProfessorResponse = {
  professor?: ProfessorProfileType;
};

function RatingCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 md:hover:-translate-y-1 md:hover:shadow-md">
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <Star className="size-4 fill-orange-500 text-orange-500" />
        <p className="text-2xl font-semibold text-gray-900">{formatRating(value)}</p>
      </div>
      <p className="mt-1 hidden text-xs text-gray-500 md:block">{hint}</p>
    </div>
  );
}

function formatReviewDate(value: string) {
  const date = new Date(value);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

export function ProfessorProfile({ professorId }: { professorId: string }) {
  const [professor, setProfessor] = useState<ProfessorProfileType>(() => findMockProfessor(professorId));
  const [reviews, setReviews] = useState<ReviewSummary[]>(() => findMockProfessor(professorId).reviews);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfessor() {
      if (!apiBaseUrl) {
        const fallback = findMockProfessor(professorId);
        setProfessor(fallback);
        setReviews(fallback.reviews);
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch(`${apiBaseUrl}/api/professors/${professorId}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Professor profile request failed");
        }

        const data = (await response.json()) as ProfessorResponse;

        if (data.professor) {
          setProfessor(data.professor);
          setReviews(data.professor.reviews || []);
        }
      } catch {
        if (!controller.signal.aborted) {
          const fallback = findMockProfessor(professorId);
          setProfessor(fallback);
          setReviews(fallback.reviews);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadProfessor();

    return () => controller.abort();
  }, [professorId]);

  const reviewCount = reviews.length || professor.reviewCount;
  const sortedReviews = useMemo(
    () =>
      [...reviews].sort(
        (first, second) =>
          new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
      ),
    [reviews],
  );

  function handleReviewCreated(review: ReviewSummary) {
    setReviews((currentReviews) => [review, ...currentReviews]);
  }

  return (
    <div className="space-y-6">
      <Link
        className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-white px-4 text-xs font-medium text-gray-600 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 md:hover:-translate-y-0.5 md:hover:text-gray-900 md:hover:shadow-md"
        href="/professors"
      >
        <ArrowLeft className="size-4" />
        Müəllimlərə qayıt
      </Link>

      <section className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-gray-900 text-white">
                <GraduationCap className="size-6" />
              </span>
              <div>
                <p className="hidden text-xs font-medium uppercase tracking-[0.16em] text-gray-400 md:block">
                  {professor.departmentName}
                </p>
                <h1 className="text-2xl font-semibold tracking-normal text-gray-900 md:mt-1 md:text-3xl">
                  {professor.fullName}
                </h1>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">{professor.title}</p>
            <p className="mt-3 hidden max-w-2xl text-sm leading-6 text-gray-600 md:block">{professor.bio}</p>
          </div>

          <div className="grid min-w-[240px] grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Star className="size-3.5 fill-orange-500 text-orange-500" />
                Ümumi
              </div>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {formatRating(professor.averageRating)}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Users className="size-3.5" />
                Rəy
              </div>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{reviewCount}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <RatingCard
          hint="Mövzuları nə qədər aydın izah edir"
          label="İzah"
          value={professor.averageTeaching}
        />
        <RatingCard
          hint="Dərs yükü və imtahan səviyyəsi"
          label="Çətinlik"
          value={professor.averageDifficulty}
        />
        <RatingCard
          hint="Qiymətləndirmə və davranış balansı"
          label="Obyektivlik"
          value={professor.averageObjectivity}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Tələbə rəyləri</h2>
              <p className="hidden text-xs text-gray-400 md:block">Digər tələbələrin real təcrübələri</p>
            </div>
            {isLoading && <span className="text-xs text-gray-400">Yenilənir...</span>}
          </div>

          {sortedReviews.map((review) => (
            <article
              className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 md:hover:-translate-y-1 md:hover:shadow-md"
              key={review.id}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{review.reviewerName}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {review.courseCode} · {review.courseTitle} · {formatReviewDate(review.createdAt)}
                  </p>
                </div>
                <div className="flex min-h-[44px] items-center gap-1 rounded-2xl bg-slate-50 px-3 text-sm font-semibold text-gray-900">
                  <Star className="size-4 fill-orange-500 text-orange-500" />
                  {review.ratingOverall}
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-600">{review.comment}</p>
              <div className="mt-4 flex flex-wrap gap-2 md:gap-3">
                <span className="rounded-2xl bg-teal-50 px-3 py-2 text-xs font-medium text-teal-700">
                  İzah {review.ratingTeaching}/5
                </span>
                <span className="rounded-2xl bg-slate-50 px-3 py-2 text-xs font-medium text-gray-600">
                  Çətinlik {review.ratingDifficulty}/5
                </span>
                <span className="rounded-2xl bg-orange-50 px-3 py-2 text-xs font-medium text-orange-600">
                  Obyektivlik {review.ratingObjectivity}/5
                </span>
              </div>
            </article>
          ))}

          {sortedReviews.length === 0 && (
            <div className="rounded-3xl bg-white p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <MessageSquare className="mx-auto size-6 text-teal-700" />
              <p className="mt-3 text-sm font-semibold text-gray-900">Hələ rəy yoxdur</p>
              <p className="mt-1 text-sm text-gray-500">İlk rəyi sən paylaşa bilərsən.</p>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <BookOpen className="size-4 text-teal-700" />
              Dərslər
            </div>
            <div className="mt-4 space-y-3">
              {professor.courses.map((course) => (
                <div className="rounded-2xl bg-slate-50 p-4" key={course.id}>
                  <p className="text-sm font-semibold text-gray-900">{course.code}</p>
                  <p className="mt-1 text-xs text-gray-500">{course.title}</p>
                </div>
              ))}
            </div>
          </div>

          <ReviewForm
            courses={professor.courses}
            professorId={professor.id}
            onReviewCreated={handleReviewCreated}
          />
        </aside>
      </section>
    </div>
  );
}
