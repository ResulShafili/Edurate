"use client";

import { Check, FileUp, Loader2, UploadCloud, X } from "lucide-react";
import type { DragEvent, FormEvent } from "react";
import { useRef, useState } from "react";

import {
  formatFileSize,
  mockResourceCourses,
  resourcesApiBaseUrl,
} from "@/lib/resources";
import type {
  ResourceCourse,
  ResourceItem,
} from "@/lib/resources";

type ResourceUploadFormProps = {
  courses?: ResourceCourse[];
  onResourceCreated?: (resource: ResourceItem) => void;
};

type ResourceResponse = {
  message?: string;
  resource?: ResourceItem;
  errors?: string[];
};

export function ResourceUploadForm({
  courses = mockResourceCourses,
  onResourceCreated,
}: ResourceUploadFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  function handleFiles(files: FileList | null) {
    const file = files?.[0] || null;
    setSelectedFile(file);
    setMessage("");
    setStatus("idle");
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const token = window.localStorage.getItem("edurate_token");

    if (!token) {
      setStatus("error");
      setMessage("Material yükləmək üçün əvvəlcə hesabına daxil ol.");
      return;
    }

    if (!resourcesApiBaseUrl) {
      setStatus("error");
      setMessage("Backend API URL aktiv deyil. NEXT_PUBLIC_API_URL dəyərini əlavə et.");
      return;
    }

    if (!selectedFile) {
      setStatus("error");
      setMessage("PDF və ya şəkil faylı seç.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.set("file", selectedFile);
    formData.set("isAnonymous", String(isAnonymous));

    try {
      const response = await fetch(`${resourcesApiBaseUrl}/api/resources`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = (await response.json()) as ResourceResponse;

      if (!response.ok) {
        throw new Error(data.errors?.join(", ") || data.message || "Material yüklənmədi");
      }

      if (data.resource) {
        onResourceCreated?.(data.resource);
      }

      event.currentTarget.reset();
      setSelectedFile(null);
      setIsAnonymous(true);
      setStatus("success");
      setMessage("Material uğurla əlavə edildi.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Server ilə əlaqə alınmadı");
    }
  }

  return (
    <form
      className="rounded-lg border border-white/70 bg-white/84 p-4 shadow-[0_18px_45px_rgba(39,35,29,0.08)] backdrop-blur-xl"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-[#eef6f1] text-sage">
          <UploadCloud className="size-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold">Material yüklə</h2>
          <p className="text-xs text-muted">PDF və ya şəkil konspektini paylaş.</p>
        </div>
      </div>

      <label className="mt-4 block">
        <span className="text-xs font-medium text-muted">Fənn</span>
        <select
          className="mt-1 h-11 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-sage"
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

      <label className="mt-3 block">
        <span className="text-xs font-medium text-muted">Başlıq</span>
        <input
          className="mt-1 h-11 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none placeholder:text-[#aaa49b] focus:border-sage"
          maxLength={160}
          minLength={3}
          name="title"
          placeholder="Məsələn: Midterm üçün SQL konspekti"
          required
        />
      </label>

      <label className="mt-3 block">
        <span className="text-xs font-medium text-muted">Qısa qeyd</span>
        <textarea
          className="mt-1 min-h-20 w-full resize-none rounded-lg border border-line bg-white px-3 py-3 text-sm outline-none placeholder:text-[#aaa49b] focus:border-sage"
          maxLength={600}
          name="description"
          placeholder="Nəyi əhatə etdiyini qısa yaz..."
        />
      </label>

      <label
        className={`mt-3 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-5 text-center transition ${
          isDragging
            ? "border-sage bg-[#eef6f1]"
            : "border-line bg-white hover:border-sage/55 hover:bg-[#f8fbf9]"
        }`}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          accept="application/pdf,image/png,image/jpeg,image/webp"
          className="hidden"
          name="file"
          type="file"
          onChange={(event) => handleFiles(event.target.files)}
        />
        <FileUp className="size-7 text-sage" />
        <span className="mt-3 text-sm font-semibold">
          Faylı sürüşdürüb-burax və ya seç
        </span>
        <span className="mt-1 text-xs text-muted">PDF, PNG, JPG, WEBP · maksimum 15MB</span>
      </label>

      {selectedFile && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-line bg-white px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{selectedFile.name}</p>
            <p className="text-xs text-muted">{formatFileSize(selectedFile.size)}</p>
          </div>
          <button
            aria-label="Faylı sil"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-[#fff4ef] hover:text-clay"
            type="button"
            onClick={() => {
              setSelectedFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <label className="mt-3 flex min-h-11 items-center gap-3 rounded-lg border border-line bg-white px-3 text-sm font-medium">
        <input
          checked={isAnonymous}
          className="size-4 accent-[#26342f]"
          name="isAnonymous"
          type="checkbox"
          onChange={(event) => setIsAnonymous(event.target.checked)}
        />
        Anonim paylaş
      </label>

      {message && (
        <p
          className={`mt-4 rounded-lg border px-3 py-2 text-xs ${
            status === "success"
              ? "border-[#cfe3d7] bg-[#f0f8f3] text-[#3f6f58]"
              : "border-[#efd4ca] bg-[#fff4ef] text-[#9b4d37]"
          }`}
        >
          {message}
        </p>
      )}

      <button
        className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(38,52,47,0.18)] transition hover:-translate-y-0.5 hover:bg-[#1f2b27] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
        disabled={status === "loading"}
        type="submit"
      >
        {status === "loading" ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
        Materialı paylaş
      </button>
    </form>
  );
}
