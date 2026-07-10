"use client";

import { Check, Loader2, MessageSquare, ShieldCheck, UserRound } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import type { CourseSummary, ReviewSummary } from "@/lib/professors";
import { apiBaseUrl } from "@/lib/professors";
import { RatingStars } from "@/components/rating-stars";
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

const semesterOptions = [
  { value: "spring", label: "Yaz" },
  { value: "summer", label: "Yay" },
  { value: "fall", label: "Payız" },
  { value: "winter", label: "Qış" },
];

export function ReviewForm({ professorId, courses, embedded = false, onReviewCreated }: ReviewFormProps) {
  const [ratingTeaching, setRatingTeaching] = useState(5);
  const [ratingDifficulty, setRatingDifficulty] = useState(3);
  const [ratingObjectivity, setRatingObjectivity] = useState(5);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const defaultCourseId = courses[0]?.id || "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const token = window.localStorage.getItem("edurate_token");

    if (!token) {
      setStatus("error");
      setMessage("Rəy yazmaq üçün əvvəlcə hesabına daxil ol.");
      return;
    }

    if (!apiBaseUrl) {
      setStatus("error");
      setMessage("Backend API URL aktiv deyil. NEXT_PUBLIC_API_URL dəyərini əlavə et.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const selectedCourse = courses.find((course) => course.id === formData.get("courseId"));
    const payload = {
      professorId,
      courseId: formData.get("courseId"),
      semester: formData.get("semester"),
      academicYear: Number(formData.get("academicYear")) || currentYear,
      ratingTeaching,
      ratingDifficulty,
      ratingObjectivity,
      wouldTakeAgain: formData.get("wouldTakeAgain") === "on",
      isAnonymous,
      comment: formData.get("comment"),
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
        throw new Error(data.errors?.join(", ") || data.message || "Rəy göndərilmədi");
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
      setRatingTeaching(5);
      setRatingDifficulty(3);
      setRatingObjectivity(5);
      setIsAnonymous(true);
      setStatus("success");
      setMessage("Rəyin əlavə edildi. Təşəkkürlər!");
      showToast({ message: "Rəy uğurla paylaşıldı" });
    } catch (error) {
      setStatus("error");
      const errorMessage = error instanceof Error ? error.message : "Server ilə əlaqə alınmadı";
      setMessage(errorMessage);
      showToast({ message: errorMessage, tone: "error" });
    }
  }

  return (
    <form
      className={
        embedded
          ? "mt-6"
          : "rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      }
      onSubmit={handleSubmit}
    >
      {!embedded && <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
          <MessageSquare className="size-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Rəy yaz</h2>
          <p className="hidden text-xs text-gray-400 md:block">Təcrübəni digər tələbələr üçün faydalı et.</p>
        </div>
      </div>}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium text-gray-500">Fənn</span>
          <select
            className="mt-2 min-h-[44px] w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-0"
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
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-medium text-gray-500">Semestr</span>
            <select
              className="mt-2 min-h-[44px] w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-0"
              defaultValue="fall"
              name="semester"
            >
              {semesterOptions.map((semester) => (
                <option key={semester.value} value={semester.value}>
                  {semester.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500">İl</span>
            <input
              className="mt-2 min-h-[44px] w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-0"
              defaultValue={currentYear}
              min={2020}
              name="academicYear"
              type="number"
            />
          </label>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <RatingStars
          label="İzah"
          name="ratingTeaching"
          value={ratingTeaching}
          onChange={setRatingTeaching}
        />
        <RatingStars
          label="Çətinlik"
          name="ratingDifficulty"
          value={ratingDifficulty}
          onChange={setRatingDifficulty}
        />
        <RatingStars
          label="Obyektivlik"
          name="ratingObjectivity"
          value={ratingObjectivity}
          onChange={setRatingObjectivity}
        />
      </div>

      <label className="mt-5 block">
        <span className="text-xs font-medium text-gray-500">Rəy</span>
        <textarea
          className="mt-2 min-h-32 w-full resize-none rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-0"
          maxLength={1600}
          name="comment"
          placeholder="Dərsin tempi, imtahan, tapşırıqlar və izah tərzi haqqında qısa yaz..."
          required
        />
      </label>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <fieldset>
          <legend className="mb-2 text-xs font-medium text-gray-500">Görünən ad</legend>
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-1">
            <button
              aria-pressed={isAnonymous}
              className={`flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold transition active:scale-[0.98] ${
                isAnonymous ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
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
                !isAnonymous ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
              type="button"
              onClick={() => setIsAnonymous(false)}
            >
              <UserRound className="size-4" />
              Adımla
            </button>
          </div>
        </fieldset>
        <label className="flex min-h-[44px] items-center gap-3 rounded-2xl border border-gray-200 bg-slate-50 px-4 text-sm font-medium text-gray-700">
          <input className="size-4 accent-gray-900" name="wouldTakeAgain" type="checkbox" />
          Yenidən bu müəllimi seçərdim
        </label>
      </div>

      {message && (
        <p
          className={`mt-5 rounded-2xl border px-4 py-3 text-xs ${
            status === "success"
              ? "border-teal-100 bg-teal-50 text-teal-700"
              : "border-orange-100 bg-orange-50 text-orange-700"
          }`}
        >
          {message}
        </p>
      )}

      <button
        className="mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 text-sm font-semibold text-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-200 md:hover:-translate-y-0.5 md:hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
        disabled={status === "loading"}
        type="submit"
      >
        {status === "loading" ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
        Rəyi göndər
      </button>
    </form>
  );
}
