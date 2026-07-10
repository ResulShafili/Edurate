"use client";

import {
  ArrowBigDown,
  ArrowBigUp,
  ArrowLeft,
  BookOpen,
  Clock3,
  MessageSquare,
  Reply,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AnswerComposer } from "@/components/answer-composer";
import {
  buildAnswerTree,
  findMockQuestion,
  formatForumDate,
  forumApiBaseUrl,
} from "@/lib/forum";
import type {
  ForumAnswer,
  ForumQuestion,
} from "@/lib/forum";

type QuestionResponse = {
  question?: ForumQuestion;
};

type VoteResponse = {
  answer?: ForumAnswer;
  message?: string;
};

type AnswerItemProps = {
  answer: ForumAnswer;
  depth?: number;
  questionId: string;
  onAnswerCreated: (answer: ForumAnswer) => void;
  onVote: (answerId: string, value: -1 | 0 | 1) => void;
};

function updateAnswer(
  answers: ForumAnswer[],
  answerId: string,
  updater: (answer: ForumAnswer) => ForumAnswer,
) {
  return answers.map((answer) => (answer.id === answerId ? updater(answer) : answer));
}

function AnswerVoteControls({
  answer,
  onVote,
}: {
  answer: ForumAnswer;
  onVote: (value: -1 | 0 | 1) => void;
}) {
  const viewerVote = answer.viewerVote || 0;

  return (
    <div className="flex items-center gap-1 rounded-2xl bg-slate-50 p-1">
      <button
        aria-label="Upvote"
        className={`flex size-11 items-center justify-center rounded-2xl transition ${
          viewerVote === 1 ? "bg-teal-50 text-teal-700" : "text-gray-400 hover:bg-white"
        }`}
        type="button"
        onClick={() => onVote(viewerVote === 1 ? 0 : 1)}
      >
        <ArrowBigUp className="size-4" />
      </button>
      <span className="min-w-6 text-center text-sm font-semibold text-gray-900">{answer.voteScore}</span>
      <button
        aria-label="Downvote"
        className={`flex size-11 items-center justify-center rounded-2xl transition ${
          viewerVote === -1 ? "bg-orange-50 text-orange-600" : "text-gray-400 hover:bg-white"
        }`}
        type="button"
        onClick={() => onVote(viewerVote === -1 ? 0 : -1)}
      >
        <ArrowBigDown className="size-4" />
      </button>
    </div>
  );
}

function AnswerItem({
  answer,
  depth = 0,
  questionId,
  onAnswerCreated,
  onVote,
}: AnswerItemProps) {
  const [isReplying, setIsReplying] = useState(false);

  return (
    <div className={depth > 0 ? "border-l border-slate-200 pl-4 md:pl-5" : ""}>
      <article className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">{answer.authorName}</p>
            <p className="mt-1 flex items-center gap-2 text-xs text-gray-400">
              <Clock3 className="size-3.5" />
              {formatForumDate(answer.createdAt)}
            </p>
          </div>
          <AnswerVoteControls
            answer={answer}
            onVote={(value) => onVote(answer.id, value)}
          />
        </div>

        <p className="mt-4 text-sm leading-6 text-gray-600">{answer.body}</p>

        <button
          className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-slate-50 px-4 text-xs font-semibold text-gray-600 transition-all duration-200 md:hover:-translate-y-0.5 md:hover:text-gray-900 md:hover:shadow-md"
          type="button"
          onClick={() => setIsReplying((current) => !current)}
        >
          <Reply className="size-3.5" />
          Cavab ver
        </button>

        {isReplying && (
          <AnswerComposer
            compact
            parentAnswerId={answer.id}
            questionId={questionId}
            onAnswerCreated={(createdAnswer) => {
              onAnswerCreated(createdAnswer);
              setIsReplying(false);
            }}
          />
        )}
      </article>

      {answer.replies && answer.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {answer.replies.map((reply) => (
            <AnswerItem
              answer={reply}
              depth={depth + 1}
              key={reply.id}
              questionId={questionId}
              onAnswerCreated={onAnswerCreated}
              onVote={onVote}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function QuestionThread({ questionSlug }: { questionSlug: string }) {
  const fallbackQuestion = findMockQuestion(questionSlug);
  const [question, setQuestion] = useState<ForumQuestion>(fallbackQuestion);
  const [answers, setAnswers] = useState<ForumAnswer[]>(fallbackQuestion.answers);
  const [isLoading, setIsLoading] = useState(false);
  const [voteMessage, setVoteMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadQuestion() {
      if (!forumApiBaseUrl) {
        const fallback = findMockQuestion(questionSlug);
        setQuestion(fallback);
        setAnswers(fallback.answers);
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch(`${forumApiBaseUrl}/api/questions/${encodeURIComponent(questionSlug)}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Question thread request failed");
        }

        const data = (await response.json()) as QuestionResponse;

        if (data.question) {
          setQuestion(data.question);
          setAnswers(data.question.answers || []);
        }
      } catch {
        if (!controller.signal.aborted) {
          const fallback = findMockQuestion(questionSlug);
          setQuestion(fallback);
          setAnswers(fallback.answers);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadQuestion();

    return () => controller.abort();
  }, [questionSlug]);

  const answerTree = useMemo(() => buildAnswerTree(answers), [answers]);

  function handleAnswerCreated(answer: ForumAnswer) {
    setAnswers((currentAnswers) => [answer, ...currentAnswers]);
    setQuestion((currentQuestion) => ({
      ...currentQuestion,
      answerCount: currentQuestion.answerCount + 1,
    }));
  }

  async function handleVote(answerId: string, value: -1 | 0 | 1) {
    const currentAnswer = answers.find((answer) => answer.id === answerId);

    if (!currentAnswer) {
      return;
    }

    const previousVote = currentAnswer.viewerVote || 0;
    const nextVote = value;
    const optimisticScore = currentAnswer.voteScore - previousVote + nextVote;

    if (forumApiBaseUrl && !window.localStorage.getItem("edurate_token")) {
      setVoteMessage("Səs vermək üçün əvvəlcə hesabına daxil ol.");
      return;
    }

    setVoteMessage("");
    setAnswers((currentAnswers) =>
      updateAnswer(currentAnswers, answerId, (answer) => ({
        ...answer,
        voteScore: optimisticScore,
        viewerVote: nextVote,
      })),
    );

    if (!forumApiBaseUrl) {
      return;
    }

    try {
      const token = window.localStorage.getItem("edurate_token");
      const response = await fetch(`${forumApiBaseUrl}/api/answers/${answerId}/vote`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: nextVote }),
      });
      const data = (await response.json()) as VoteResponse;

      if (!response.ok) {
        throw new Error(data.message || "Səs saxlanmadı");
      }

      if (data.answer) {
        setAnswers((currentAnswers) =>
          updateAnswer(currentAnswers, answerId, (answer) => ({
            ...answer,
            ...data.answer,
            viewerVote: nextVote,
          })),
        );
      }
    } catch (error) {
      setAnswers((currentAnswers) =>
        updateAnswer(currentAnswers, answerId, (answer) => ({
          ...answer,
          voteScore: currentAnswer.voteScore,
          viewerVote: previousVote,
        })),
      );
      setVoteMessage(error instanceof Error ? error.message : "Səs saxlanmadı");
    }
  }

  return (
    <div className="space-y-6">
      <Link
        className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-white px-4 text-xs font-medium text-gray-600 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-200 md:hover:-translate-y-0.5 md:hover:text-gray-900 md:hover:shadow-md"
        href="/forum"
      >
        <ArrowLeft className="size-4" />
        Foruma qayıt
      </Link>

      <section className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-2xl bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700">
                {question.courseCode}
              </span>
              <span className="text-xs text-gray-400">{question.courseTitle}</span>
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-normal text-gray-900 md:text-3xl">
              {question.title}
            </h1>
            <p className="mt-4 text-sm leading-6 text-gray-600">{question.body}</p>
          </div>

          <div className="grid min-w-[220px] grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <MessageSquare className="size-3.5" />
                Cavab
              </div>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{question.answerCount}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <BookOpen className="size-3.5" />
                Səs
              </div>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{question.voteScore}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 text-xs text-gray-500">
          <span className="rounded-2xl bg-slate-50 px-3 py-2">
            {question.authorName}
          </span>
          <span className="rounded-2xl bg-slate-50 px-3 py-2">
            {formatForumDate(question.createdAt)}
          </span>
          {isLoading && (
            <span className="rounded-2xl bg-slate-50 px-3 py-2">
              Yenilənir...
            </span>
          )}
        </div>
      </section>

      <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="min-w-0 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Cavablar</h2>
            <p className="mt-1 hidden text-xs text-gray-400 md:block">
              Yüksək səs alan cavablar yuxarıda, alt cavablar isə öz thread-i altında qalır.
            </p>
          </div>

          {voteMessage && (
            <p className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-xs text-orange-700">
              {voteMessage}
            </p>
          )}

          {answerTree.map((answer) => (
            <AnswerItem
              answer={answer}
              key={answer.id}
              questionId={question.id}
              onAnswerCreated={handleAnswerCreated}
              onVote={handleVote}
            />
          ))}

          {answerTree.length === 0 && (
            <div className="rounded-3xl bg-white p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <MessageSquare className="mx-auto size-6 text-teal-700" />
              <p className="mt-3 text-sm font-semibold text-gray-900">Hələ cavab yoxdur</p>
              <p className="mt-1 text-sm text-gray-500">İlk faydalı cavabı sən paylaşa bilərsən.</p>
              <a
                className="mx-auto mt-5 flex min-h-[44px] w-fit items-center justify-center rounded-2xl bg-gray-900 px-5 text-sm font-semibold text-white"
                href="#answer-composer"
              >
                Cavab yaz
              </a>
            </div>
          )}
        </div>

        <aside className="min-w-0">
          <AnswerComposer questionId={question.id} onAnswerCreated={handleAnswerCreated} />
        </aside>
      </section>
    </div>
  );
}
