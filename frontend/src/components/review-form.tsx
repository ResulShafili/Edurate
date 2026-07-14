"use client";

import {
  Check,
  ChevronDown,
  GraduationCap,
  ListChecks,
  Loader2,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import {
  agreementOptions,
  apiBaseUrl,
} from "@/lib/professors";
import type {
  AgreementValue,
  CourseSummary,
  ReviewSummary,
} from "@/lib/professors";
import { showToast } from "@/lib/toast";

type ReviewFormProps = {
  professorId: string;
  courses: CourseSummary[];
  embedded?: boolean;
  onReviewCreated?: (review: ReviewSummary) => void;
};

type ReviewResponse = {
  message?: string;
  review?: ReviewSummary;
  errors?: string[];
};

type AgreementFieldProps = {
  category: string;
  id: string;
  question: string;
  tone: string;
  value: AgreementValue | null;
  onChange: (value: AgreementValue) => void;
};

const semesterOptions = [
  { value: "spring", label: "Yaz" },
  { value: "summer", label: "Yay" },
  { value: "fall", label: "Payız" },
  { value: "winter", label: "Qış" },
];

function AgreementField({
  category,
  id,
  question,
  tone,
  value,
  onChange,
}: AgreementFieldProps) {
  return (
    <fieldset className="rounded-[1.45rem] border border-[#e5ece9] bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <legend className="sr-only">{question}</legend>
      <div className="flex items-start gap-3">
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-semibold ${tone}`}>
          {category.slice(0, 1)}
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">{category}</p>
          <p className="mt-1 text-sm font-medium leading-5 text-gray-900" id={`${id}-question`}>
            {question}
          </p>
        </div>
      </div>

      <div className="relative mt-4 sm:hidden">
        <select
          aria-labelledby={`${id}-question`}
          className="min-h-[48px] w-full appearance-none rounded-2xl border border-gray-200 bg-slate-50 px-4 pr-11 text-sm font-medium text-gray-900 outline-none focus:border-gray-400 focus:ring-0"
          id={id}
          required
          value={value ?? ""}
          onChange={(event) => onChange(Number(event.target.value) as AgreementValue)}
        >
          <option disabled value="">Cavabını seç</option>
          {agreementOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
      </div>

      <div
        aria-labelledby={`${id}-question`}
        className="mt-4 hidden grid-cols-5 gap-2 sm:grid"
        role="radiogroup"
      >
        {agreementOptions.map((option) => {
          const isSelected = value === option.value;

          return (
            <button
              aria-checked={isSelected}
              aria-label={`${question}: ${option.label}`}
              className={`flex min-h-[58px] flex-col items-center justify-center rounded-2xl border px-2 text-center transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                isSelected
                  ? "border-[#17362f] bg-[#17362f] text-white shadow-[0_8px_20px_rgba(23,54,47,0.12)] dark:border-teal-500 dark:bg-teal-600"
                  : "border-[#e4ebe8] bg-[#f8faf9] text-gray-500 hover:border-[#aacfc5] hover:bg-[#eff8f5] dark:border-white/10 dark:bg-white/5"
              }`}
              key={option.value}
              role="radio"
              type="button"
              onClick={() => onChange(option.value)}
            >
              <span className="text-[10px] font-semibold opacity-60">{option.value}</span>
              <span className="mt-0.5 text-[11px] font-semibold leading-4">{option.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function ReviewForm({
  professorId,
  courses,
  embedded = false,
  onReviewCreated,
}: ReviewFormProps) {
  const [ratingOverall, setRatingOverall] = useState<AgreementValue | null>(null);
  const [ratingTeaching, setRatingTeaching] = useState<AgreementValue | null>(null);
  const [ratingCourseBalance, setRatingCourseBalance] = useState<AgreementValue | null>(null);
  const [ratingObjectivity, setRatingObjectivity] = useState<AgreementValue | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const defaultCourseId = courses[0]?.id || "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (
      ratingOverall === null
      || ratingTeaching === null
      || ratingCourseBalance === null
      || ratingObjectivity === null
    ) {
      setStatus("error");
      setMessage("Bütün kateqoriyalar üzrə cavab seç.");
      return;
    }

    const token = window.localStorage.getItem("edurate_token");

    if (!token) {
      setStatus("error");
      setMessage("Qiymətləndirmək üçün əvvəlcə hesabına daxil ol.");
      return;
    }

    if (!apiBaseUrl) {
      setStatus("error");
      setMessage("Backend API URL aktiv deyil. NEXT_PUBLIC_API_URL dəyərini əlavə et.");
      return;
    }

    setStatus("loading");

    const formData = new FormData(event.currentTarget);
    const selectedCourse = courses.find((course) => course.id === formData.get("courseId"));
    const payload = {
      professorId,
      courseId: formData.get("courseId"),
      semester: formData.get("semester"),
      academicYear: Number(formData.get("academicYear")) || currentYear,
      ratingOverall,
      ratingTeaching,
      ratingCourseBalance,
      ratingObjectivity,
      wouldTakeAgain: ratingOverall >= 4,
      isAnonymous,
    };

    try {
      const response = await fetch(`${apiBaseUrl}/api/reviews`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as ReviewResponse;

      if (!response.ok) {
        throw new Error(data.errors?.join(", ") || data.message || "Qiymətləndirmə göndərilmədi");
      }

      const createdReview = data.review
        ? {
            ...data.review,
            courseCode: selectedCourse?.code || "",
            courseTitle: selectedCourse?.title || "",
            reviewerName: payload.isAnonymous ? "Anonim tələbə" : "Sən",
          }
        : null;

      if (createdReview) {
        onReviewCreated?.(createdReview);
      }

      event.currentTarget.reset();
      setRatingOverall(null);
      setRatingTeaching(null);
      setRatingCourseBalance(null);
      setRatingObjectivity(null);
      setIsAnonymous(true);
      setStatus("success");
      setMessage("Qiymətləndirmən əlavə edildi. Təşəkkürlər!");
      showToast({ message: "Qiymətləndirmə uğurla paylaşıldı" });
    } catch (error) {
      setStatus("error");
      const errorMessage = error instanceof Error ? error.message : "Server ilə əlaqə alınmadı";
      setMessage(errorMessage);
      showToast({ message: errorMessage, tone: "error" });
    }
  }

  return (
    <form
      className={embedded ? "mt-6" : "app-card rounded-[1.75rem] p-5 md:p-6"}
      onSubmit={handleSubmit}
    >
      {!embedded && (
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
            <ListChecks className="size-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Müəllimi qiymətləndir</h2>
            <p className="hidden text-xs text-gray-400 md:block">Dörd kateqoriya üzrə qısa seçim et.</p>
          </div>
        </div>
      )}

      <div className="rounded-[1.45rem] border border-[#e5ece9] bg-[#f8faf9] p-4 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="flex items-center gap-2 text-xs text-[#0e705e] dark:text-teal-300">
          <ShieldCheck className="size-4" />
          <span className="font-medium">Açıq mətn yoxdur, yalnız təhlükəsiz seçimlər saxlanılır.</span>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-gray-500">Qiymətləndirilən fənn</span>
            <span className="relative mt-2 block">
              <GraduationCap className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <select
                className="min-h-[48px] w-full appearance-none rounded-2xl border border-gray-200 bg-white pl-11 pr-10 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-0"
                defaultValue={defaultCourseId}
                name="courseId"
                required
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} · {course.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            </span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-gray-500">Semestr</span>
              <span className="relative mt-2 block">
                <select
                  className="min-h-[48px] w-full appearance-none rounded-2xl border border-gray-200 bg-white px-4 pr-9 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-0"
                  defaultValue="fall"
                  name="semester"
                >
                  {semesterOptions.map((semester) => (
                    <option key={semester.value} value={semester.value}>
                      {semester.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              </span>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-500">İl</span>
              <input
                className="mt-2 min-h-[48px] w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-0"
                defaultValue={currentYear}
                min={2020}
                name="academicYear"
                type="number"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <AgreementField
          category="Müəllim · İzah"
          id="rating-teaching"
          question="Müəllim mövzuları aydın və anlaşıqlı izah edir."
          tone="bg-[#fff0e6] text-[#d75a34] dark:bg-orange-500/10 dark:text-orange-300"
          value={ratingTeaching}
          onChange={setRatingTeaching}
        />
        <AgreementField
          category="Müəllim · Obyektivlik"
          id="rating-objectivity"
          question="Müəllim qiymətləndirmədə və tələbələrlə münasibətdə obyektivdir."
          tone="bg-[#e9f1ff] text-[#3e6fb1] dark:bg-blue-500/10 dark:text-blue-300"
          value={ratingObjectivity}
          onChange={setRatingObjectivity}
        />
        <AgreementField
          category="Fənn · Balans"
          id="rating-course-balance"
          question="Dərsin tempi, tapşırıq yükü və imtahan səviyyəsi balanslıdır."
          tone="bg-[#dff4ec] text-[#0e7a65] dark:bg-teal-500/10 dark:text-teal-300"
          value={ratingCourseBalance}
          onChange={setRatingCourseBalance}
        />
        <AgreementField
          category="Ümumi tövsiyə"
          id="rating-overall"
          question="Bu müəllimlə həmin fənni başqa tələbəyə tövsiyə edərdim."
          tone="bg-[#fff6cf] text-[#745900] dark:bg-yellow-500/10 dark:text-yellow-200"
          value={ratingOverall}
          onChange={setRatingOverall}
        />
      </div>

      <fieldset className="mt-4">
        <legend className="mb-2 text-xs font-medium text-gray-500">Görünən ad</legend>
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[#e5ece9] bg-[#f8faf9] p-1 dark:border-white/10 dark:bg-white/[0.03]">
          <button
            aria-pressed={isAnonymous}
            className={`flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold transition active:scale-[0.98] ${
              isAnonymous ? "bg-white text-gray-900 shadow-[0_5px_14px_rgba(25,49,42,0.06)] dark:bg-white/10" : "text-gray-500"
            }`}
            type="button"
            onClick={() => setIsAnonymous(true)}
          >
            <ShieldCheck className="size-4" />
            Anonim
          </button>
          <button
            aria-pressed={!isAnonymous}
            className={`flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold transition active:scale-[0.98] ${
              !isAnonymous ? "bg-white text-gray-900 shadow-[0_5px_14px_rgba(25,49,42,0.06)] dark:bg-white/10" : "text-gray-500"
            }`}
            type="button"
            onClick={() => setIsAnonymous(false)}
          >
            <UserRound className="size-4" />
            Adımla
          </button>
        </div>
      </fieldset>

      {message && (
        <p
          className={`mt-4 rounded-2xl border px-4 py-3 text-xs ${
            status === "success"
              ? "border-teal-100 bg-teal-50 text-teal-700"
              : "border-orange-100 bg-orange-50 text-orange-700"
          }`}
          role="status"
        >
          {message}
        </p>
      )}

      <button
        className="app-button-primary mt-5 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={status === "loading" || courses.length === 0}
        type="submit"
      >
        {status === "loading" ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
        Qiymətləndirməni göndər
      </button>
    </form>
  );
}
