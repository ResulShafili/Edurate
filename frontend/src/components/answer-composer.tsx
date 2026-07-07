"use client";

import { Loader2, Send } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

import { forumApiBaseUrl } from "@/lib/forum";
import type { ForumAnswer } from "@/lib/forum";

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
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Server ilə əlaqə alınmadı");
    }
  }

  return (
    <form
      className={
        compact
          ? "mt-3 rounded-lg border border-line bg-white px-3 py-3"
          : "rounded-lg border border-white/70 bg-white/84 p-4 shadow-[0_18px_45px_rgba(39,35,29,0.08)] backdrop-blur-xl"
      }
      onSubmit={handleSubmit}
    >
      {!compact && (
        <div>
          <h2 className="text-base font-semibold">Cavab yaz</h2>
          <p className="mt-1 text-xs text-muted">Mövzunu bilirsənsə, qısa və faydalı izah paylaş.</p>
        </div>
      )}

      <textarea
        className={`${compact ? "min-h-20" : "mt-4 min-h-32"} w-full resize-none rounded-lg border border-line bg-white px-3 py-3 text-sm outline-none placeholder:text-[#aaa49b] focus:border-sage`}
        maxLength={3000}
        minLength={2}
        name="body"
        placeholder={compact ? "Bu cavaba reply yaz..." : "Cavabını yaz..."}
        required
      />

      {message && (
        <p
          className={`mt-3 rounded-lg border px-3 py-2 text-xs ${
            status === "success"
              ? "border-[#cfe3d7] bg-[#f0f8f3] text-[#3f6f58]"
              : "border-[#efd4ca] bg-[#fff4ef] text-[#9b4d37]"
          }`}
        >
          {message}
        </p>
      )}

      <button
        className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(38,52,47,0.16)] transition hover:-translate-y-0.5 hover:bg-[#1f2b27] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
        disabled={status === "loading"}
        type="submit"
      >
        {status === "loading" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Cavabı göndər
      </button>
    </form>
  );
}
