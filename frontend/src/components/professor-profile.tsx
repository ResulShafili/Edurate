"use client";

import {
  ArrowLeft,
  BookOpen,
  CircleCheck,
  Gauge,
  GraduationCap,
  Lightbulb,
  ListChecks,
  PencilLine,
  Scale,
  ShieldCheck,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ReviewDialog } from "@/components/review-dialog";
import {
  apiBaseUrl,
  findMockProfessor,
  formatRating,
  getAgreementLabel,
} from "@/lib/professors";
import type {
  ProfessorProfile as ProfessorProfileType,
  ReviewSummary,
} from "@/lib/professors";

type ProfessorResponse = {
  professor?: ProfessorProfileType;
};

type ReviewSort = "newest" | "highest";

function RatingCard({
  barClass,
  icon: Icon,
  iconClass,
  label,
  value,
  hint,
}: {
  barClass: string;
  icon: LucideIcon;
  iconClass: string;
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="app-card interactive-lift rounded-[1.65rem] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-gray-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{formatRating(value)}</p>
        </div>
        <span className={`flex size-10 items-center justify-center rounded-2xl ${iconClass}`}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-1 hidden text-xs text-gray-500 md:block">{hint}</p>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-[width] duration-200 ${barClass}`}
          style={{ width: `${Math.max(0, Math.min(value, 5)) * 20}%` }}
        />
      </div>
    </div>
  );
}

function StructuredRating({
  label,
  tone,
  value,
}: {
  label: string;
  tone: string;
  value: number;
}) {
  return (
    <div className={`rounded-2xl border p-3.5 ${tone}`}>
      <dt className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.06em] opacity-70">
        <CircleCheck className="size-3.5" />
        {label}
      </dt>
      <dd className="mt-2 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold leading-4">{getAgreementLabel(value)}</span>
        <span className="shrink-0 rounded-full bg-white/70 px-2 py-1 text-[10px] font-semibold dark:bg-white/10">
          {value}/5
        </span>
      </dd>
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

export function ProfessorProfile({ professorSlug }: { professorSlug: string }) {
  const [professor, setProfessor] = useState<ProfessorProfileType>(() => findMockProfessor(professorSlug));
  const [reviews, setReviews] = useState<ReviewSummary[]>(() => findMockProfessor(professorSlug).reviews);
  const [isLoading, setIsLoading] = useState(false);
  const [reviewSort, setReviewSort] = useState<ReviewSort>("newest");
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfessor() {
      if (!apiBaseUrl) {
        const fallback = findMockProfessor(professorSlug);
        setProfessor(fallback);
        setReviews(fallback.reviews);
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch(`${apiBaseUrl}/api/professors/${encodeURIComponent(professorSlug)}`, {
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
          const fallback = findMockProfessor(professorSlug);
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
  }, [professorSlug]);

  const reviewCount = reviews.length || professor.reviewCount;
  const sortedReviews = useMemo(() => {
    return [...reviews].sort((first, second) => {
      if (reviewSort === "highest" && second.ratingOverall !== first.ratingOverall) {
        return second.ratingOverall - first.ratingOverall;
      }

      return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
    });
  }, [reviewSort, reviews]);

  function handleReviewCreated(review: ReviewSummary) {
    setReviews((currentReviews) => [review, ...currentReviews]);
  }

  return (
    <div className="space-y-6">
      <Link
        className="app-button-secondary inline-flex min-h-[44px] items-center gap-2 rounded-2xl px-4 text-xs font-medium transition-all duration-200 hover:text-gray-900"
        href="/professors"
      >
        <ArrowLeft className="size-4" />
        Müəllimlərə qayıt
      </Link>

      <section className="relative overflow-hidden rounded-[1.9rem] border border-[#d6ebe4] bg-[#edf8f4] p-5 shadow-[0_14px_42px_rgba(25,49,42,0.05)] dark:border-teal-500/10 dark:bg-teal-500/10 md:p-7">
        <span className="absolute inset-y-7 left-0 w-1.5 rounded-r-full bg-[#35a58c]" />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-[#17362f] text-white shadow-[0_8px_20px_rgba(23,54,47,0.16)] dark:bg-teal-600">
                <GraduationCap className="size-6" />
              </span>
              <div>
                <p className="hidden text-xs font-medium uppercase tracking-normal text-gray-400 md:block">
                  {professor.departmentName}
                </p>
                <h1 className="text-2xl font-semibold tracking-normal text-gray-900 md:mt-1 md:text-3xl">
                  {professor.fullName}
                </h1>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">{professor.title}</p>
            <p className="mt-3 hidden max-w-2xl text-sm leading-6 text-gray-600 md:block">{professor.bio}</p>
            <button
              className="app-button-primary mt-5 flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 sm:w-auto"
              type="button"
              onClick={() => setIsReviewDialogOpen(true)}
            >
              <PencilLine className="size-4" />
              Qiymətləndir
            </button>
          </div>

          <div className="grid min-w-[240px] grid-cols-2 divide-x divide-[#dcebe6] overflow-hidden rounded-2xl border border-white/80 bg-white/70 dark:divide-white/10 dark:border-white/10 dark:bg-white/5">
            <div className="p-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Star className="size-3.5 fill-orange-500 text-orange-500" />
                Ümumi
              </div>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {formatRating(professor.averageRating)}
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#f4e9df] dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-orange-500"
                  style={{ width: `${Math.max(0, Math.min(professor.averageRating, 5)) * 20}%` }}
                />
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <BookOpen className="size-3.5" />
                Dərs balansı
              </div>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {formatRating(professor.averageCourseBalance)}
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#dcebe6] dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-teal-600"
                  style={{ width: `${Math.max(0, Math.min(professor.averageCourseBalance, 5)) * 20}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <RatingCard
          barClass="bg-orange-500"
          hint="Mövzuları nə qədər aydın izah edir"
          icon={Lightbulb}
          iconClass="bg-orange-50 text-orange-600"
          label="İzah"
          value={professor.averageTeaching}
        />
        <RatingCard
          barClass="bg-teal-600"
          hint="Dərs tempi, tapşırıq yükü və imtahan səviyyəsi"
          icon={Gauge}
          iconClass="bg-teal-50 text-teal-700"
          label="Dərs balansı"
          value={professor.averageCourseBalance}
        />
        <RatingCard
          barClass="bg-blue-500"
          hint="Qiymətləndirmə və davranış balansı"
          icon={Scale}
          iconClass="bg-blue-50 text-blue-600"
          label="Obyektivlik"
          value={professor.averageObjectivity}
        />
      </section>

      <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Tələbə qiymətləndirmələri</h2>
              <p className="mt-1 text-xs text-gray-400">{reviewCount} strukturlaşdırılmış nəticə</p>
            </div>
            <div className="flex items-center gap-2">
              {isLoading && <span className="text-xs text-gray-400">Yenilənir...</span>}
              <label>
                <span className="sr-only">Qiymətləndirmələri sırala</span>
                <select
                  className="min-h-[44px] rounded-2xl border border-gray-200 bg-slate-50 px-4 text-xs font-semibold text-gray-700 outline-none focus:border-gray-400 focus:ring-0"
                  value={reviewSort}
                  onChange={(event) => setReviewSort(event.target.value as ReviewSort)}
                >
                  <option value="newest">Ən yeni</option>
                  <option value="highest">Ən yüksək nəticə</option>
                </select>
              </label>
            </div>
          </div>

          {sortedReviews.map((review) => (
            <article
              className="app-card interactive-lift rounded-[1.65rem] p-5"
              key={review.id}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{review.reviewerName}</p>
                    {review.isAnonymous && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-1 text-[11px] font-medium text-teal-700">
                        <ShieldCheck className="size-3" />
                        Anonim tələbə
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    {review.courseCode} · {review.courseTitle} · {formatReviewDate(review.createdAt)}
                  </p>
                </div>
                <div className="flex min-h-[44px] items-center gap-2 rounded-2xl bg-[#fff6cf] px-3 text-xs font-semibold text-[#745900] dark:bg-yellow-500/10 dark:text-yellow-200">
                  <CircleCheck className="size-4" />
                  {getAgreementLabel(review.ratingOverall)}
                </div>
              </div>
              <dl className="mt-4 grid gap-2 sm:grid-cols-2">
                <StructuredRating
                  label="İzah"
                  tone="border-orange-100 bg-orange-50 text-orange-700"
                  value={review.ratingTeaching}
                />
                <StructuredRating
                  label="Obyektivlik"
                  tone="border-blue-100 bg-blue-50 text-blue-700"
                  value={review.ratingObjectivity}
                />
                <StructuredRating
                  label="Dərs balansı"
                  tone="border-teal-100 bg-teal-50 text-teal-700"
                  value={review.ratingCourseBalance}
                />
                <StructuredRating
                  label="Ümumi tövsiyə"
                  tone="border-yellow-100 bg-[#fffaf0] text-[#745900] dark:border-yellow-500/10 dark:bg-yellow-500/10 dark:text-yellow-200"
                  value={review.ratingOverall}
                />
              </dl>
            </article>
          ))}

          {sortedReviews.length === 0 && (
            <div className="app-card rounded-3xl p-8 text-center">
              <ListChecks className="mx-auto size-6 text-teal-700" />
              <p className="mt-3 text-sm font-semibold text-gray-900">Hələ qiymətləndirmə yoxdur</p>
              <p className="mt-1 text-sm text-gray-500">İlk strukturlaşdırılmış qiymətləndirməni sən et.</p>
              <button
                className="mx-auto mt-5 flex min-h-[44px] items-center justify-center rounded-2xl bg-gray-900 px-5 text-sm font-semibold text-white"
                type="button"
                onClick={() => setIsReviewDialogOpen(true)}
              >
                İlk qiymətləndirməni et
              </button>
            </div>
          )}
        </div>

        <aside className="min-w-0 space-y-4">
          <div className="app-card rounded-[1.65rem] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <BookOpen className="size-4 text-teal-700" />
              Dərslər
            </div>
            <div className="mt-4 divide-y divide-slate-100 dark:divide-white/10">
              {professor.courses.map((course) => (
                <div className="py-4 first:pt-0 last:pb-0" key={course.id}>
                  <p className="text-sm font-semibold text-gray-900">{course.code}</p>
                  <p className="mt-1 text-xs text-gray-500">{course.title}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.65rem] bg-[#17362f] p-5 text-white shadow-[0_14px_36px_rgba(23,54,47,0.14)] dark:bg-[#102921]">
            <ListChecks className="size-5 text-teal-300" />
            <p className="mt-4 text-base font-semibold">Təcrübən başqasına yol göstərə bilər.</p>
            <p className="mt-2 text-sm leading-6 text-gray-300">
              Dörd qısa kateqoriyanı anonim və ya öz adınla qiymətləndir.
            </p>
            <button
              className="mt-5 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-[#ffffff] px-4 text-sm font-semibold text-[#17362f] transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
              type="button"
              onClick={() => setIsReviewDialogOpen(true)}
            >
              <PencilLine className="size-4" />
              Qiymətləndir
            </button>
          </div>
        </aside>
      </section>

      <ReviewDialog
        courses={professor.courses}
        isOpen={isReviewDialogOpen}
        professorId={professor.id}
        professorName={professor.fullName}
        onClose={() => setIsReviewDialogOpen(false)}
        onReviewCreated={handleReviewCreated}
      />
    </div>
  );
}
