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
      className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
          <UploadCloud className="size-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Material yüklə</h2>
          <p className="hidden text-xs text-gray-400 md:block">PDF və ya şəkil konspektini paylaş.</p>
        </div>
      </div>

      <label className="mt-5 block">
        <span className="text-xs font-medium text-gray-500">Fənn</span>
        <select
          className="mt-2 min-h-[44px] w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-0"
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

      <label className="mt-4 block">
        <span className="text-xs font-medium text-gray-500">Başlıq</span>
        <input
          className="mt-2 min-h-[44px] w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-0"
          maxLength={160}
          minLength={3}
          name="title"
          placeholder="Məsələn: Midterm üçün SQL konspekti"
          required
        />
      </label>

      <label className="mt-4 block">
        <span className="text-xs font-medium text-gray-500">Qısa qeyd</span>
        <textarea
          className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-0"
          maxLength={600}
          name="description"
          placeholder="Nəyi əhatə etdiyini qısa yaz..."
        />
      </label>

      <label
        className={`mt-4 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed px-5 py-6 text-center transition ${
          isDragging
            ? "border-teal-300 bg-teal-50"
            : "border-slate-200 bg-slate-50 hover:border-teal-200 hover:bg-white"
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
        <FileUp className="size-7 text-teal-700" />
        <span className="mt-3 text-sm font-semibold text-gray-900">
          Faylı sürüşdürüb-burax və ya seç
        </span>
        <span className="mt-1 text-xs text-gray-400">PDF, PNG, JPG, WEBP · maksimum 15MB</span>
      </label>

      {selectedFile && (
        <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">{selectedFile.name}</p>
            <p className="text-xs text-gray-400">{formatFileSize(selectedFile.size)}</p>
          </div>
          <button
            aria-label="Faylı sil"
            className="flex size-11 shrink-0 items-center justify-center rounded-2xl text-gray-400 transition hover:bg-orange-50 hover:text-orange-600"
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

      <label className="mt-4 flex min-h-[44px] items-center gap-3 rounded-2xl border border-gray-200 bg-slate-50 px-4 text-sm font-medium text-gray-700">
        <input
          checked={isAnonymous}
          className="size-4 accent-gray-900"
          name="isAnonymous"
          type="checkbox"
          onChange={(event) => setIsAnonymous(event.target.checked)}
        />
        Anonim paylaş
      </label>

      {message && (
        <p
          className={`mt-5 rounded-2xl border px-4 py-3 text-xs ${
            status === "success"
              ? "border-teal-100 bg-teal-50 text-teal-700"
              : "border-orange-100 bg-orange-50 text-orange-700"
          }`}
        >
          {message}
        </p>
      )}

      <button
        className="mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 text-sm font-semibold text-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 md:hover:-translate-y-0.5 md:hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
        disabled={status === "loading"}
        type="submit"
      >
        {status === "loading" ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
        Materialı paylaş
      </button>
    </form>
  );
}
