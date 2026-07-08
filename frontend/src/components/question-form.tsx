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
      className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
          <Plus className="size-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Yeni sual</h2>
          <p className="hidden text-xs text-gray-400 md:block">Fənn üzrə qısa və dəqiq soruş.</p>
        </div>
      </div>

      <label className="mt-5 block">
        <span className="text-xs font-medium text-gray-500">Fənn</span>
        <select
          className="mt-2 min-h-[44px] w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-0"
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

      <label className="mt-4 block">
        <span className="text-xs font-medium text-gray-500">Başlıq</span>
        <input
          className="mt-2 min-h-[44px] w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-0"
          maxLength={180}
          minLength={8}
          name="title"
          placeholder="Məsələn: 3NF ilə BCNF fərqi nədir?"
          required
        />
      </label>

      <label className="mt-4 block">
        <span className="text-xs font-medium text-gray-500">Sual</span>
        <textarea
          className="mt-2 min-h-32 w-full resize-none rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-0"
          maxLength={4000}
          minLength={12}
          name="body"
          placeholder="Harada ilişdiyini, hansı mövzunu qarışdırdığını yaz..."
          required
        />
      </label>

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
        className="mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 text-sm font-semibold text-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 md:hover:-translate-y-0.5 md:hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
        disabled={status === "loading"}
        type="submit"
      >
        {status === "loading" ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        Sualı paylaş
      </button>
    </form>
  );
}
