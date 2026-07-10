"use client";

import { BookOpen, Scale, Star, Users, X } from "lucide-react";
import Link from "next/link";

import { useDialogFocus } from "@/hooks/use-dialog-focus";
import {
  formatRating,
  getProfessorSlug,
} from "@/lib/professors";
import type { ProfessorSummary } from "@/lib/professors";

type ProfessorCompareDialogProps = {
  isOpen: boolean;
  professors: ProfessorSummary[];
  onClose: () => void;
};

export function ProfessorCompareDialog({
  isOpen,
  professors,
  onClose,
}: ProfessorCompareDialogProps) {
  const { closeButtonRef, dialogRef } = useDialogFocus(isOpen, onClose);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-labelledby="compare-dialog-title"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-end justify-center bg-gray-950/45 backdrop-blur-sm sm:items-center sm:p-6"
      ref={dialogRef}
      role="dialog"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          onClose();
        }
      }}
    >
      <div className="max-h-[92dvh] w-full max-w-5xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] sm:rounded-3xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Scale className="size-5" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-gray-900" id="compare-dialog-title">
                Müəllim müqayisəsi
              </h2>
              <p className="mt-1 text-sm text-gray-500">Əsas göstəriciləri yan-yana nəzərdən keçir.</p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            aria-label="Müqayisəni bağla"
            className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-gray-500 transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            type="button"
            onClick={onClose}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:hidden">
          {professors.map((professor) => (
            <article className="rounded-3xl border border-slate-200 bg-slate-50 p-5" key={professor.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{professor.fullName}</h3>
                  <p className="mt-1 text-xs text-gray-500">{professor.departmentName}</p>
                </div>
                <span className="flex items-center gap-1 rounded-xl bg-white px-2.5 py-2 text-sm font-semibold text-gray-900">
                  <Star className="size-3.5 fill-orange-500 text-orange-500" />
                  {formatRating(professor.averageRating)}
                </span>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl bg-white p-3">
                  <dt className="text-gray-400">Fənn</dt>
                  <dd className="mt-1 font-semibold text-gray-900">{professor.courses[0]?.code || "—"}</dd>
                </div>
                <div className="rounded-2xl bg-white p-3">
                  <dt className="text-gray-400">Çətinlik</dt>
                  <dd className="mt-1 font-semibold text-gray-900">{formatRating(professor.averageDifficulty)}</dd>
                </div>
                <div className="rounded-2xl bg-white p-3">
                  <dt className="text-gray-400">Rəy sayı</dt>
                  <dd className="mt-1 font-semibold text-gray-900">{professor.reviewCount}</dd>
                </div>
                <div className="rounded-2xl bg-white p-3">
                  <dt className="text-gray-400">İzah</dt>
                  <dd className="mt-1 font-semibold text-gray-900">{formatRating(professor.averageTeaching)}</dd>
                </div>
              </dl>
              <Link
                className="mt-4 flex min-h-[44px] w-full items-center justify-center rounded-2xl bg-gray-900 px-4 text-sm font-semibold text-white"
                href={`/professors/${getProfessorSlug(professor)}`}
                onClick={onClose}
              >
                Profilə bax
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-6 hidden overflow-x-auto rounded-3xl border border-slate-200 md:block">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="w-44 px-5 py-4 text-xs font-medium text-gray-400">Göstərici</th>
                {professors.map((professor) => (
                  <th className="px-5 py-4" key={professor.id}>
                    <Link
                      className="font-semibold text-gray-900 hover:text-teal-700"
                      href={`/professors/${getProfessorSlug(professor)}`}
                      onClick={onClose}
                    >
                      {professor.fullName}
                    </Link>
                    <p className="mt-1 text-xs font-normal text-gray-400">{professor.departmentName}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <th className="px-5 py-4 text-xs font-medium text-gray-500">Fənlər</th>
                {professors.map((professor) => (
                  <td className="px-5 py-4 text-gray-700" key={professor.id}>
                    <span className="inline-flex items-center gap-2">
                      <BookOpen className="size-4 text-teal-700" />
                      {professor.courses.map((course) => course.code).join(", ") || "—"}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <th className="px-5 py-4 text-xs font-medium text-gray-500">Ümumi reytinq</th>
                {professors.map((professor) => (
                  <td className="px-5 py-4 font-semibold text-gray-900" key={professor.id}>
                    <span className="inline-flex items-center gap-2">
                      <Star className="size-4 fill-orange-500 text-orange-500" />
                      {formatRating(professor.averageRating)} / 5
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <th className="px-5 py-4 text-xs font-medium text-gray-500">Çətinlik</th>
                {professors.map((professor) => (
                  <td className="px-5 py-4 font-semibold text-gray-900" key={professor.id}>
                    {formatRating(professor.averageDifficulty)} / 5
                  </td>
                ))}
              </tr>
              <tr>
                <th className="px-5 py-4 text-xs font-medium text-gray-500">Rəy sayı</th>
                {professors.map((professor) => (
                  <td className="px-5 py-4 text-gray-700" key={professor.id}>
                    <span className="inline-flex items-center gap-2">
                      <Users className="size-4 text-blue-600" />
                      {professor.reviewCount}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
