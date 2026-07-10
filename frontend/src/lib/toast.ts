export type ToastTone = "success" | "error";

export type ToastDetail = {
  message: string;
  tone?: ToastTone;
};

export const toastEventName = "edurate-toast";

export function showToast(detail: ToastDetail) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<ToastDetail>(toastEventName, {
      detail: {
        ...detail,
        tone: detail.tone || "success",
      },
    }),
  );
}
