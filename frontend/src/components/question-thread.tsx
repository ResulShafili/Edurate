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
    <div className="flex items-center gap-1 rounded-lg border border-line bg-white px-1 py-1">
      <button
        aria-label="Upvote"
        className={`flex size-8 items-center justify-center rounded-md transition hover:bg-[#eef6f1] ${
          viewerVote === 1 ? "bg-[#eef6f1] text-sage" : "text-muted"
        }`}
        type="button"
        onClick={() => onVote(viewerVote === 1 ? 0 : 1)}
      >
        <ArrowBigUp className="size-4" />
      </button>
      <span className="min-w-6 text-center text-sm font-semibold">{answer.voteScore}</span>
      <button
        aria-label="Downvote"
        className={`flex size-8 items-center justify-center rounded-md transition hover:bg-[#fff4ef] ${
          viewerVote === -1 ? "bg-[#fff4ef] text-clay" : "text-muted"
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
    <div className={depth > 0 ? "border-l border-line pl-4" : ""}>
      <article className="rounded-lg border border-white/70 bg-white/84 p-4 shadow-[0_14px_34px_rgba(39,35,29,0.06)] backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold">{answer.authorName}</p>
            <p className="mt-1 flex items-center gap-2 text-xs text-muted">
              <Clock3 className="size-3.5" />
              {formatForumDate(answer.createdAt)}
            </p>
          </div>
          <AnswerVoteControls
            answer={answer}
            onVote={(value) => onVote(answer.id, value)}
          />
        </div>

        <p className="mt-3 text-sm leading-6 text-muted">{answer.body}</p>

        <button
          className="mt-4 inline-flex h-8 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-muted transition hover:-translate-y-0.5 hover:text-foreground hover:shadow-md"
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
        <div className="mt-3 space-y-3">
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

export function QuestionThread({ questionId }: { questionId: string }) {
  const fallbackQuestion = findMockQuestion(questionId);
  const [question, setQuestion] = useState<ForumQuestion>(fallbackQuestion);
  const [answers, setAnswers] = useState<ForumAnswer[]>(fallbackQuestion.answers);
  const [isLoading, setIsLoading] = useState(false);
  const [voteMessage, setVoteMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadQuestion() {
      if (!forumApiBaseUrl) {
        const fallback = findMockQuestion(questionId);
        setQuestion(fallback);
        setAnswers(fallback.answers);
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch(`${forumApiBaseUrl}/api/questions/${questionId}`, {
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
          const fallback = findMockQuestion(questionId);
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
  }, [questionId]);

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
    <div className="space-y-4">
      <Link
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-white/78 px-3 text-xs font-medium text-muted shadow-[0_10px_28px_rgba(31,28,24,0.06)] backdrop-blur-md transition hover:-translate-y-0.5 hover:text-foreground hover:shadow-md"
        href="/forum"
      >
        <ArrowLeft className="size-4" />
        Foruma qayıt
      </Link>

      <section className="rounded-lg border border-white/70 bg-white/84 p-4 shadow-[0_18px_45px_rgba(39,35,29,0.08)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-[#eef6f1] px-2 py-1 text-xs font-semibold text-sage">
                {question.courseCode}
              </span>
              <span className="text-xs text-muted">{question.courseTitle}</span>
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
              {question.title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted">{question.body}</p>
          </div>

          <div className="grid min-w-[220px] grid-cols-2 gap-2">
            <div className="rounded-lg border border-line bg-white p-3">
              <div className="flex items-center gap-2 text-xs text-muted">
                <MessageSquare className="size-3.5" />
                Cavab
              </div>
              <p className="mt-1 text-2xl font-semibold">{question.answerCount}</p>
            </div>
            <div className="rounded-lg border border-line bg-white p-3">
              <div className="flex items-center gap-2 text-xs text-muted">
                <BookOpen className="size-3.5" />
                Səs
              </div>
              <p className="mt-1 text-2xl font-semibold">{question.voteScore}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
          <span className="rounded-lg border border-line bg-white px-2 py-1">
            {question.authorName}
          </span>
          <span className="rounded-lg border border-line bg-white px-2 py-1">
            {formatForumDate(question.createdAt)}
          </span>
          {isLoading && (
            <span className="rounded-lg border border-line bg-white px-2 py-1">
              Yenilənir...
            </span>
          )}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_390px]">
        <div className="space-y-3">
          <div>
            <h2 className="text-base font-semibold">Cavablar</h2>
            <p className="mt-1 text-xs text-muted">
              Yüksək səs alan cavablar yuxarıda, alt cavablar isə öz thread-i altında qalır.
            </p>
          </div>

          {voteMessage && (
            <p className="rounded-lg border border-[#efd4ca] bg-[#fff4ef] px-3 py-2 text-xs text-[#9b4d37]">
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
            <div className="rounded-lg border border-white/70 bg-white/84 p-8 text-center shadow-[0_14px_34px_rgba(39,35,29,0.06)] backdrop-blur-xl">
              <MessageSquare className="mx-auto size-6 text-sage" />
              <p className="mt-3 text-sm font-semibold">Hələ cavab yoxdur</p>
              <p className="mt-1 text-sm text-muted">İlk faydalı cavabı sən paylaşa bilərsən.</p>
            </div>
          )}
        </div>

        <aside>
          <AnswerComposer questionId={question.id} onAnswerCreated={handleAnswerCreated} />
        </aside>
      </section>
    </div>
  );
}
