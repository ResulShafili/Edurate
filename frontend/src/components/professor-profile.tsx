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
    <div className="rounded-lg border border-white/70 bg-white/84 p-4 shadow-[0_14px_34px_rgba(39,35,29,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <p className="text-xs font-medium text-muted">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <Star className="size-4 fill-clay text-clay" />
        <p className="text-2xl font-semibold">{formatRating(value)}</p>
      </div>
      <p className="mt-1 text-xs text-muted">{hint}</p>
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
    <div className="space-y-4">
      <Link
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-white/78 px-3 text-xs font-medium text-muted shadow-[0_10px_28px_rgba(31,28,24,0.06)] backdrop-blur-md transition hover:-translate-y-0.5 hover:text-foreground hover:shadow-md"
        href="/professors"
      >
        <ArrowLeft className="size-4" />
        Müəllimlərə qayıt
      </Link>

      <section className="rounded-lg border border-white/70 bg-white/84 p-4 shadow-[0_18px_45px_rgba(39,35,29,0.08)] backdrop-blur-xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-lg bg-ink text-white">
                <GraduationCap className="size-6" />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                  {professor.departmentName}
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
                  {professor.fullName}
                </h1>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted">{professor.title}</p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{professor.bio}</p>
          </div>

          <div className="grid min-w-[240px] grid-cols-2 gap-2">
            <div className="rounded-lg border border-line bg-white p-3">
              <div className="flex items-center gap-2 text-xs text-muted">
                <Star className="size-3.5 fill-clay text-clay" />
                Ümumi
              </div>
              <p className="mt-1 text-2xl font-semibold">
                {formatRating(professor.averageRating)}
              </p>
            </div>
            <div className="rounded-lg border border-line bg-white p-3">
              <div className="flex items-center gap-2 text-xs text-muted">
                <Users className="size-3.5" />
                Rəy
              </div>
              <p className="mt-1 text-2xl font-semibold">{reviewCount}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
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

      <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Tələbə rəyləri</h2>
              <p className="text-xs text-muted">Digər tələbələrin real təcrübələri</p>
            </div>
            {isLoading && <span className="text-xs text-muted">Yenilənir...</span>}
          </div>

          {sortedReviews.map((review) => (
            <article
              className="rounded-lg border border-white/70 bg-white/84 p-4 shadow-[0_14px_34px_rgba(39,35,29,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              key={review.id}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">{review.reviewerName}</p>
                  <p className="mt-1 text-xs text-muted">
                    {review.courseCode} · {review.courseTitle} · {formatReviewDate(review.createdAt)}
                  </p>
                </div>
                <div className="flex h-8 items-center gap-1 rounded-lg border border-line bg-white px-2 text-sm font-semibold">
                  <Star className="size-3.5 fill-clay text-clay" />
                  {review.ratingOverall}
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">{review.comment}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-lg bg-[#eef6f1] px-2 py-1 text-xs font-medium text-sage">
                  İzah {review.ratingTeaching}/5
                </span>
                <span className="rounded-lg bg-[#f7f5f0] px-2 py-1 text-xs font-medium text-muted">
                  Çətinlik {review.ratingDifficulty}/5
                </span>
                <span className="rounded-lg bg-[#fff4ef] px-2 py-1 text-xs font-medium text-clay">
                  Obyektivlik {review.ratingObjectivity}/5
                </span>
              </div>
            </article>
          ))}

          {sortedReviews.length === 0 && (
            <div className="rounded-lg border border-white/70 bg-white/84 p-8 text-center shadow-[0_14px_34px_rgba(39,35,29,0.06)] backdrop-blur-xl">
              <MessageSquare className="mx-auto size-6 text-sage" />
              <p className="mt-3 text-sm font-semibold">Hələ rəy yoxdur</p>
              <p className="mt-1 text-sm text-muted">İlk rəyi sən paylaşa bilərsən.</p>
            </div>
          )}
        </div>

        <aside className="space-y-3">
          <div className="rounded-lg border border-white/70 bg-white/84 p-4 shadow-[0_14px_34px_rgba(39,35,29,0.06)] backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <BookOpen className="size-4 text-sage" />
              Dərslər
            </div>
            <div className="mt-3 space-y-2">
              {professor.courses.map((course) => (
                <div className="rounded-lg border border-line bg-white p-3" key={course.id}>
                  <p className="text-sm font-semibold">{course.code}</p>
                  <p className="mt-1 text-xs text-muted">{course.title}</p>
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
