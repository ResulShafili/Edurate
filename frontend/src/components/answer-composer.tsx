"use client";

import { Loader2, Send } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

import { forumApiBaseUrl } from "@/lib/forum";
import type { ForumAnswer } from "@/lib/forum";
import { showToast } from "@/lib/toast";

type AnswerComposerProps = {
  questionId: string;
  parentAnswerId?: string | null;
  compact?: boolean;
  onAnswerCreated?: (answer: ForumAnswer) => void;
};

type AnswerResponse = {
  message?: string;
  answer?: ForumAnswer;
  errors?: string[];
};

export function AnswerComposer({
  questionId,
  parentAnswerId = null,
  compact = false,
  onAnswerCreated,
}: AnswerComposerProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const token = window.localStorage.getItem("edurate_token");

    if (!token) {
      setStatus("error");
      setMessage("Cavab yazmaq üçün əvvəlcə hesabına daxil ol.");
      return;
    }

    if (!forumApiBaseUrl) {
      setStatus("error");
      setMessage("Backend API URL aktiv deyil. NEXT_PUBLIC_API_URL dəyərini əlavə et.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const payload = {
      body: String(formData.get("body") || ""),
      parentAnswerId,
    };

    try {
      const response = await fetch(`${forumApiBaseUrl}/api/questions/${questionId}/answers`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as AnswerResponse;

      if (!response.ok) {
        throw new Error(data.errors?.join(", ") || data.message || "Cavab göndərilmədi");
      }

      if (data.answer) {
        onAnswerCreated?.({
          ...data.answer,
          viewerVote: 0,
          replies: [],
        });
      }

      event.currentTarget.reset();
      setStatus("success");
      setMessage("Cavabın əlavə edildi.");
      showToast({ message: "Cavab uğurla paylaşıldı" });
    } catch (error) {
      setStatus("error");
      const errorMessage = error instanceof Error ? error.message : "Server ilə əlaqə alınmadı";
      setMessage(errorMessage);
      showToast({ message: errorMessage, tone: "error" });
    }
  }

  return (
    <form
      id={compact ? undefined : "answer-composer"}
      className={
        compact
          ? "mt-4 rounded-2xl border border-gray-200 bg-white p-4"
          : "rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      }
      onSubmit={handleSubmit}
    >
      {!compact && (
        <div>
          <h2 className="text-base font-semibold text-gray-900">Cavab yaz</h2>
          <p className="mt-1 hidden text-xs text-gray-400 md:block">Mövzunu bilirsənsə, qısa və faydalı izah paylaş.</p>
        </div>
      )}

      <textarea
        className={`${compact ? "min-h-24" : "mt-5 min-h-32"} w-full resize-none rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-0`}
        maxLength={3000}
        minLength={2}
        name="body"
        placeholder={compact ? "Bu cavaba reply yaz..." : "Cavabını yaz..."}
        required
      />

      {message && (
        <p
          className={`mt-4 rounded-2xl border px-4 py-3 text-xs ${
            status === "success"
              ? "border-teal-100 bg-teal-50 text-teal-700"
              : "border-orange-100 bg-orange-50 text-orange-700"
          }`}
        >
          {message}
        </p>
      )}

      <button
        className="mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 text-sm font-semibold text-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-200 md:hover:-translate-y-0.5 md:hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
        disabled={status === "loading"}
        type="submit"
      >
        {status === "loading" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Cavabı göndər
      </button>
    </form>
  );
}
