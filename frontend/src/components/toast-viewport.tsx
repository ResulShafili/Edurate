"use client";

import { CheckCircle2, CircleAlert, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { toastEventName } from "@/lib/toast";
import type { ToastDetail, ToastTone } from "@/lib/toast";

type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
};

export function ToastViewport() {
  const nextIdRef = useRef(1);
  const timersRef = useRef(new Map<number, number>());
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const timers = timersRef.current;

    function dismiss(id: number) {
      setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
      const timer = timers.get(id);

      if (timer) {
        window.clearTimeout(timer);
        timers.delete(id);
      }
    }

    function handleToast(event: Event) {
      const detail = (event as CustomEvent<ToastDetail>).detail;
      const id = nextIdRef.current;
      nextIdRef.current += 1;

      setToasts((currentToasts) => [
        ...currentToasts.slice(-2),
        {
          id,
          message: detail.message,
          tone: detail.tone || "success",
        },
      ]);

      timers.set(
        id,
        window.setTimeout(() => {
          dismiss(id);
        }, 3600),
      );
    }

    window.addEventListener(toastEventName, handleToast);

    return () => {
      window.removeEventListener(toastEventName, handleToast);
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, []);

  function dismissToast(id: number) {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
    const timer = timersRef.current.get(id);

    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }

  return (
    <div
      aria-atomic="true"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-end gap-2 sm:left-auto sm:w-[360px]"
    >
      {toasts.map((toast) => {
        const Icon = toast.tone === "success" ? CheckCircle2 : CircleAlert;

        return (
          <div
            className={`pointer-events-auto flex w-full items-center gap-3 rounded-2xl border bg-white p-3 shadow-[0_8px_30px_rgb(0,0,0,0.08)] ${
              toast.tone === "success" ? "border-teal-100" : "border-orange-100"
            }`}
            key={toast.id}
            role="status"
          >
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
                toast.tone === "success"
                  ? "bg-teal-50 text-teal-700"
                  : "bg-orange-50 text-orange-700"
              }`}
            >
              <Icon className="size-4" />
            </span>
            <p className="min-w-0 flex-1 text-sm font-medium leading-5 text-gray-900">
              {toast.message}
            </p>
            <button
              aria-label="Mesajı bağla"
              className="flex size-10 shrink-0 items-center justify-center rounded-xl text-gray-400 hover:bg-slate-50 hover:text-gray-900"
              type="button"
              onClick={() => dismissToast(toast.id)}
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
