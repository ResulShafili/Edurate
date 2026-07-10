"use client";

import { MessageSquareText, X } from "lucide-react";

import { ReviewForm } from "@/components/review-form";
import { useDialogFocus } from "@/hooks/use-dialog-focus";
import type { CourseSummary, ReviewSummary } from "@/lib/professors";

type ReviewDialogProps = {
  courses: CourseSummary[];
  isOpen: boolean;
  professorId: string;
  professorName: string;
  onClose: () => void;
  onReviewCreated: (review: ReviewSummary) => void;
};

export function ReviewDialog({
  courses,
  isOpen,
  professorId,
  professorName,
  onClose,
  onReviewCreated,
}: ReviewDialogProps) {
  const { closeButtonRef, dialogRef } = useDialogFocus(isOpen, onClose);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-labelledby="review-dialog-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-gray-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      ref={dialogRef}
      role="dialog"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          onClose();
        }
      }}
    >
      <div className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] sm:rounded-3xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
              <MessageSquareText className="size-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-gray-900" id="review-dialog-title">
                Rəyini paylaş
              </h2>
              <p className="mt-1 truncate text-sm text-gray-500">{professorName}</p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            aria-label="Rəy pəncərəsini bağla"
            className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-gray-500 transition active:scale-95 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            type="button"
            onClick={onClose}
          >
            <X className="size-4" />
          </button>
        </div>

        <ReviewForm
          embedded
          courses={courses}
          professorId={professorId}
          onReviewCreated={(review) => {
            onReviewCreated(review);
            onClose();
          }}
        />
      </div>
    </div>
  );
}
