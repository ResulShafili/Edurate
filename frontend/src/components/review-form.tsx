"use client";

import { Check, Loader2, MessageSquare } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import type { CourseSummary, ReviewSummary } from "@/lib/professors";
import { apiBaseUrl } from "@/lib/professors";
import { RatingStars } from "@/components/rating-stars";

type ReviewFormProps = {
  professorId: string;
  courses: CourseSummary[];
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

export function ReviewForm({ professorId, courses, onReviewCreated }: ReviewFormProps) {
  const [ratingTeaching, setRatingTeaching] = useState(5);
  const [ratingDifficulty, setRatingDifficulty] = useState(3);
  const [ratingObjectivity, setRatingObjectivity] = useState(5);
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
      isAnonymous: formData.get("isAnonymous") === "on",
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
      setStatus("success");
      setMessage("Rəyin əlavə edildi. Təşəkkürlər!");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Server ilə əlaqə alınmadı");
    }
  }

  return (
    <form
      className="rounded-lg border border-white/70 bg-white/84 p-4 shadow-[0_18px_45px_rgba(39,35,29,0.08)] backdrop-blur-xl"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-[#eef6f1] text-sage">
          <MessageSquare className="size-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold">Rəy yaz</h2>
          <p className="text-xs text-muted">Təcrübəni digər tələbələr üçün faydalı et.</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium text-muted">Fənn</span>
          <select
            className="mt-1 h-11 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-sage"
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

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-xs font-medium text-muted">Semestr</span>
            <select
              className="mt-1 h-11 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-sage"
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
            <span className="text-xs font-medium text-muted">İl</span>
            <input
              className="mt-1 h-11 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-sage"
              defaultValue={currentYear}
              min={2020}
              name="academicYear"
              type="number"
            />
          </label>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
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

      <label className="mt-4 block">
        <span className="text-xs font-medium text-muted">Rəy</span>
        <textarea
          className="mt-1 min-h-28 w-full resize-none rounded-lg border border-line bg-white px-3 py-3 text-sm outline-none placeholder:text-[#aaa49b] focus:border-sage"
          maxLength={1600}
          name="comment"
          placeholder="Dərsin tempi, imtahan, tapşırıqlar və izah tərzi haqqında qısa yaz..."
          required
        />
      </label>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <label className="flex min-h-11 items-center gap-3 rounded-lg border border-line bg-white px-3 text-sm font-medium">
          <input className="size-4 accent-[#26342f]" defaultChecked name="isAnonymous" type="checkbox" />
          Rəyimi anonim paylaş
        </label>
        <label className="flex min-h-11 items-center gap-3 rounded-lg border border-line bg-white px-3 text-sm font-medium">
          <input className="size-4 accent-[#26342f]" name="wouldTakeAgain" type="checkbox" />
          Yenidən bu müəllimi seçərdim
        </label>
      </div>

      {message && (
        <p
          className={`mt-4 rounded-lg border px-3 py-2 text-xs ${
            status === "success"
              ? "border-[#cfe3d7] bg-[#f0f8f3] text-[#3f6f58]"
              : "border-[#efd4ca] bg-[#fff4ef] text-[#9b4d37]"
          }`}
        >
          {message}
        </p>
      )}

      <button
        className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(38,52,47,0.18)] transition hover:-translate-y-0.5 hover:bg-[#1f2b27] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
        disabled={status === "loading"}
        type="submit"
      >
        {status === "loading" ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
        Rəyi göndər
      </button>
    </form>
  );
}
