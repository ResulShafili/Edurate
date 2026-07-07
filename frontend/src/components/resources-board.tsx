"use client";

import {
  Download,
  FileImage,
  FileText,
  FolderOpen,
  Search,
  UploadCloud,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ResourceUploadForm } from "@/components/resource-upload-form";
import {
  formatFileSize,
  formatResourceDate,
  mockResourceCourses,
  mockResources,
  resolveResourceUrl,
  resourcesApiBaseUrl,
} from "@/lib/resources";
import type {
  ResourceCourse,
  ResourceFileType,
  ResourceItem,
} from "@/lib/resources";

type ResourcesResponse = {
  resources?: ResourceItem[];
};

type CoursesResponse = {
  courses?: ResourceCourse[];
};

const fileTypeFilters = [
  { value: "all", label: "Hamısı" },
  { value: "pdf", label: "PDF" },
  { value: "image", label: "Şəkil" },
] as const;

function searchResources(resources: ResourceItem[], search: string) {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return resources;
  }

  return resources.filter((resource) =>
    `${resource.title} ${resource.description || ""} ${resource.fileName} ${resource.courseCode} ${resource.courseTitle}`
      .toLowerCase()
      .includes(normalizedSearch),
  );
}

function ResourceFileIcon({ fileType }: { fileType: ResourceFileType }) {
  if (fileType === "image") {
    return <FileImage className="size-5" />;
  }

  return <FileText className="size-5" />;
}

function ResourceCard({ resource }: { resource: ResourceItem }) {
  const downloadUrl = resolveResourceUrl(resource.fileUrl);

  return (
    <article className="group rounded-lg border border-white/70 bg-white/84 p-4 shadow-[0_14px_34px_rgba(39,35,29,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <span
            className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${
              resource.fileType === "pdf"
                ? "bg-[#fff4ef] text-clay"
                : "bg-[#eef6f1] text-sage"
            }`}
          >
            <ResourceFileIcon fileType={resource.fileType} />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-[#f7f5f0] px-2 py-1 text-xs font-semibold text-muted">
                {resource.courseCode}
              </span>
              <span className="text-xs text-muted">{resource.courseTitle}</span>
            </div>
            <h2 className="mt-3 text-base font-semibold leading-6 text-foreground">
              {resource.title}
            </h2>
            {resource.description && (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                {resource.description}
              </p>
            )}
          </div>
        </div>

        <a
          aria-label="Yüklə"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-line bg-white text-muted transition hover:-translate-y-0.5 hover:text-foreground hover:shadow-md"
          download
          href={downloadUrl}
        >
          <Download className="size-4" />
        </a>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg bg-white px-3 py-2 text-xs text-muted">
          <p className="font-medium text-foreground">{resource.fileName}</p>
          <p className="mt-1">{formatFileSize(resource.fileSizeBytes)}</p>
        </div>
        <div className="rounded-lg bg-[#f7f5f0] px-3 py-2 text-xs text-muted">
          <p>Yükləyən</p>
          <p className="mt-1 font-medium text-foreground">{resource.uploaderName}</p>
        </div>
        <div className="rounded-lg bg-[#eef6f1] px-3 py-2 text-xs text-sage">
          <p>Tarix</p>
          <p className="mt-1 font-semibold">{formatResourceDate(resource.createdAt)}</p>
        </div>
      </div>
    </article>
  );
}

export function ResourcesBoard() {
  const [search, setSearch] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("all");
  const [selectedFileType, setSelectedFileType] = useState<"all" | ResourceFileType>("all");
  const [courses, setCourses] = useState<ResourceCourse[]>(mockResourceCourses);
  const [resources, setResources] = useState<ResourceItem[]>(mockResources);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCourses() {
      if (!resourcesApiBaseUrl) {
        setCourses(mockResourceCourses);
        return;
      }

      try {
        const response = await fetch(`${resourcesApiBaseUrl}/api/courses`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Course list request failed");
        }

        const data = (await response.json()) as CoursesResponse;
        setCourses(data.courses?.length ? data.courses : mockResourceCourses);
      } catch {
        if (!controller.signal.aborted) {
          setCourses(mockResourceCourses);
        }
      }
    }

    loadCourses();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadResources() {
      if (!resourcesApiBaseUrl) {
        const filteredByCourse =
          selectedCourseId === "all"
            ? mockResources
            : mockResources.filter((resource) => resource.courseId === selectedCourseId);
        const filteredByType =
          selectedFileType === "all"
            ? filteredByCourse
            : filteredByCourse.filter((resource) => resource.fileType === selectedFileType);

        setResources(searchResources(filteredByType, search));
        return;
      }

      setIsLoading(true);

      try {
        const params = new URLSearchParams();

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (selectedFileType !== "all") {
          params.set("fileType", selectedFileType);
        }

        const endpoint =
          selectedCourseId === "all"
            ? `${resourcesApiBaseUrl}/api/resources?${params.toString()}`
            : `${resourcesApiBaseUrl}/api/courses/${selectedCourseId}/resources?${params.toString()}`;

        const response = await fetch(endpoint, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Resource list request failed");
        }

        const data = (await response.json()) as ResourcesResponse;
        setResources(data.resources || []);
      } catch {
        if (!controller.signal.aborted) {
          const filteredByCourse =
            selectedCourseId === "all"
              ? mockResources
              : mockResources.filter((resource) => resource.courseId === selectedCourseId);
          const filteredByType =
            selectedFileType === "all"
              ? filteredByCourse
              : filteredByCourse.filter((resource) => resource.fileType === selectedFileType);

          setResources(searchResources(filteredByType, search));
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    const timer = window.setTimeout(loadResources, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [search, selectedCourseId, selectedFileType]);

  const sortedResources = useMemo(
    () =>
      [...resources].sort(
        (first, second) =>
          new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
      ),
    [resources],
  );

  function handleResourceCreated(resource: ResourceItem) {
    setResources((currentResources) => [resource, ...currentResources]);
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Modul D · Resources
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
            Konspekt və materiallar
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            PDF və şəkil konspektlərini fənnə görə süz, yüklə və imtahana hazırlığı paylaş.
          </p>
        </div>

        <label className="relative block w-full lg:w-[420px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            className="h-11 w-full rounded-lg border border-line bg-white/82 pl-9 pr-3 text-sm shadow-[0_10px_28px_rgba(31,28,24,0.06)] outline-none backdrop-blur-md transition focus:border-sage"
            placeholder="Material, fənn və ya fayl adı axtar"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </header>

      <section className="grid gap-4 xl:grid-cols-[1fr_390px]">
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              className={`h-9 shrink-0 rounded-lg border px-3 text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-md ${
                selectedCourseId === "all"
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white/84 text-muted"
              }`}
              type="button"
              onClick={() => setSelectedCourseId("all")}
            >
              Bütün fənlər
            </button>
            {courses.map((course) => (
              <button
                className={`h-9 shrink-0 rounded-lg border px-3 text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-md ${
                  selectedCourseId === course.id
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-white/84 text-muted"
                }`}
                key={course.id}
                type="button"
                onClick={() => setSelectedCourseId(course.id)}
              >
                {course.code}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {fileTypeFilters.map((filter) => (
              <button
                className={`h-9 rounded-lg border px-3 text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-md ${
                  selectedFileType === filter.value
                    ? "border-sage bg-[#eef6f1] text-sage"
                    : "border-line bg-white/84 text-muted"
                }`}
                key={filter.value}
                type="button"
                onClick={() => setSelectedFileType(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="grid gap-3">
            {sortedResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>

          {sortedResources.length === 0 && (
            <div className="rounded-lg border border-white/70 bg-white/84 p-8 text-center shadow-[0_14px_34px_rgba(39,35,29,0.06)] backdrop-blur-xl">
              <FolderOpen className="mx-auto size-6 text-sage" />
              <p className="mt-3 text-sm font-semibold">Material tapılmadı</p>
              <p className="mt-1 text-sm text-muted">Başqa fənn və ya fayl adı ilə axtar.</p>
            </div>
          )}

          {isLoading && (
            <p className="text-center text-xs font-medium text-muted">Yenilənir...</p>
          )}
        </div>

        <aside className="space-y-3">
          <div className="rounded-lg border border-white/70 bg-white/84 p-4 shadow-[0_14px_34px_rgba(39,35,29,0.06)] backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <UploadCloud className="size-4 text-clay" />
              Material axını
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-line bg-white p-3">
                <p className="text-2xl font-semibold">{sortedResources.length}</p>
                <p className="text-xs text-muted">Görünən fayl</p>
              </div>
              <div className="rounded-lg border border-line bg-white p-3">
                <p className="text-2xl font-semibold">
                  {sortedResources.filter((resource) => resource.fileType === "pdf").length}
                </p>
                <p className="text-xs text-muted">PDF</p>
              </div>
            </div>
          </div>

          <ResourceUploadForm courses={courses} onResourceCreated={handleResourceCreated} />
        </aside>
      </section>
    </div>
  );
}
