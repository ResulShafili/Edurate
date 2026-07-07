"use client";

import { Loader2, Plus } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

import {
  forumApiBaseUrl,
  mockCourses,
} from "@/lib/forum";
import type {
  ForumCourse,
  ForumQuestionSummary,
} from "@/lib/forum";

type QuestionFormProps = {
  courses?: ForumCourse[];
  onQuestionCreated?: (question: ForumQuestionSummary) => void;
};

type QuestionResponse = {
  message?: string;
  question?: ForumQuestionSummary;
  errors?: string[];
};

export function QuestionForm({
  courses = mockCourses,
  onQuestionCreated,
}: QuestionFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const token = window.localStorage.getItem("edurate_token");

    if (!token) {
      setStatus("error");
      setMessage("Sual yazmaq üçün əvvəlcə hesabına daxil ol.");
      return;
    }

    if (!forumApiBaseUrl) {
      setStatus("error");
      setMessage("Backend API URL aktiv deyil. NEXT_PUBLIC_API_URL dəyərini əlavə et.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const payload = {
      courseId: String(formData.get("courseId") || ""),
      title: String(formData.get("title") || ""),
      body: String(formData.get("body") || ""),
    };

    try {
      const response = await fetch(`${forumApiBaseUrl}/api/questions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as QuestionResponse;

      if (!response.ok) {
        throw new Error(data.errors?.join(", ") || data.message || "Sual göndərilmədi");
      }

      if (data.question) {
        onQuestionCreated?.(data.question);
      }

      event.currentTarget.reset();
      setStatus("success");
      setMessage("Sualın foruma əlavə edildi.");
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
          <Plus className="size-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold">Yeni sual</h2>
          <p className="text-xs text-muted">Fənn üzrə qısa və dəqiq soruş.</p>
        </div>
      </div>

      <label className="mt-4 block">
        <span className="text-xs font-medium text-muted">Fənn</span>
        <select
          className="mt-1 h-11 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-sage"
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

      <label className="mt-3 block">
        <span className="text-xs font-medium text-muted">Başlıq</span>
        <input
          className="mt-1 h-11 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none placeholder:text-[#aaa49b] focus:border-sage"
          maxLength={180}
          minLength={8}
          name="title"
          placeholder="Məsələn: 3NF ilə BCNF fərqi nədir?"
          required
        />
      </label>

      <label className="mt-3 block">
        <span className="text-xs font-medium text-muted">Sual</span>
        <textarea
          className="mt-1 min-h-28 w-full resize-none rounded-lg border border-line bg-white px-3 py-3 text-sm outline-none placeholder:text-[#aaa49b] focus:border-sage"
          maxLength={4000}
          minLength={12}
          name="body"
          placeholder="Harada ilişdiyini, hansı mövzunu qarışdırdığını yaz..."
          required
        />
      </label>

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
        {status === "loading" ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        Sualı paylaş
      </button>
    </form>
  );
}
