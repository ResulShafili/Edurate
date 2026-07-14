"use client";

import { Bell, CheckCheck, FileText, MessageSquare, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useAuthUser } from "@/hooks/use-auth-user";
import { getQuestionSlug, mockQuestions } from "@/lib/forum";
import { getProfessorSlug, mockProfessors } from "@/lib/professors";

const notifications = [
  {
    id: "question-answer",
    title: "Sualına yeni cavab gəldi",
    detail: "useEffect mövzusunda yeni izah paylaşılıb.",
    href: `/forum/${getQuestionSlug(mockQuestions[2])}`,
    time: "12 dəq əvvəl",
    icon: MessageSquare,
    tone: "bg-teal-50 text-teal-700",
  },
  {
    id: "professor-review",
    title: "İzlədiyin müəllimə yeni qiymətləndirmə gəldi",
    detail: "Nigar Mammadovanın profilində yeni nəticə var.",
    href: `/professors/${getProfessorSlug(mockProfessors[0])}`,
    time: "2 saat əvvəl",
    icon: Star,
    tone: "bg-orange-50 text-orange-600",
  },
  {
    id: "resource-reaction",
    title: "Materialına reaksiya var",
    detail: "Yüklədiyin konspekt faydalı kimi qeyd edildi.",
    href: "/resources",
    time: "Dünən",
    icon: FileText,
    tone: "bg-blue-50 text-blue-600",
  },
] as const;

const storageKey = "edurate_read_notifications";

export function NotificationCenter() {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const { isReady, user } = useAuthUser();
  const [readIds, setReadIds] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      const storedValue = window.localStorage.getItem(storageKey);

      if (storedValue) {
        try {
          setReadIds(JSON.parse(storedValue) as string[]);
        } catch {
          setReadIds([]);
        }
      }

      setIsHydrated(true);
    }, 0);

    return () => window.clearTimeout(hydrationTimer);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      window.localStorage.setItem(storageKey, JSON.stringify(readIds));
    }
  }, [isHydrated, readIds]);

  if (!isReady || !user) {
    return null;
  }

  const unreadCount = notifications.filter((notification) => !readIds.includes(notification.id)).length;

  function markAsRead(id: string) {
    setReadIds((currentIds) => (currentIds.includes(id) ? currentIds : [...currentIds, id]));
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
  }

  return (
    <details className="group relative" ref={detailsRef}>
      <summary
        aria-label={`Bildirişlər${unreadCount ? `, ${unreadCount} oxunmamış` : ""}`}
        className="app-card relative flex size-11 cursor-pointer list-none items-center justify-center rounded-2xl text-gray-500 transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 [&::-webkit-details-marker]:hidden"
        title="Bildirişlər"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-slate-50">
            {unreadCount}
          </span>
        )}
      </summary>

      <div className="app-surface fixed inset-x-3 top-[76px] z-50 max-h-[calc(100dvh-100px)] overflow-y-auto rounded-3xl p-2 sm:absolute sm:inset-x-auto sm:right-0 sm:top-[calc(100%+10px)] sm:w-[390px]">
        <div className="flex items-center justify-between gap-3 px-3 py-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Bildirişlər</p>
            <p className="mt-0.5 text-xs text-gray-400">{unreadCount} oxunmamış bildiriş</p>
          </div>
          {unreadCount > 0 && (
            <button
              className="flex min-h-[44px] items-center gap-2 rounded-xl px-3 text-xs font-semibold text-teal-700 hover:bg-teal-50"
              type="button"
              onClick={() => setReadIds(notifications.map((notification) => notification.id))}
            >
              <CheckCheck className="size-4" />
              Hamısını oxu
            </button>
          )}
        </div>

        <div className="space-y-1">
          {notifications.map((notification) => {
            const Icon = notification.icon;
            const isUnread = !readIds.includes(notification.id);

            return (
              <Link
                className={`flex gap-3 rounded-2xl p-3 transition hover:bg-[#eff8f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:hover:bg-teal-500/10 ${
                  isUnread ? "bg-[#f4f8f6] dark:bg-white/5" : ""
                }`}
                href={notification.href}
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
              >
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${notification.tone}`}>
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start gap-2">
                    <span className="block flex-1 text-sm font-medium leading-5 text-gray-900">
                      {notification.title}
                    </span>
                    {isUnread && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-red-500" />}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-gray-500">
                    {notification.detail}
                  </span>
                  <span className="mt-1 block text-[11px] text-gray-400">{notification.time}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </details>
  );
}
