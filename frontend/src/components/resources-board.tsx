"use client";

import {
  CalendarDays,
  Download,
  FileImage,
  FileText,
  FolderOpen,
  HardDrive,
  Search,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ResourceUploadForm } from "@/components/resource-upload-form";
import { ContentSkeleton } from "@/components/content-skeleton";
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
    <article className="app-card interactive-lift group relative overflow-hidden rounded-[1.65rem] p-5">
      <span className={`absolute inset-y-5 left-0 w-1 rounded-r-full ${resource.fileType === "pdf" ? "bg-[#ed7650]" : "bg-[#6e9fe0]"}`} />
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-4">
          <span
            className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${
              resource.fileType === "pdf"
                ? "bg-[#fff0e6] text-[#d75a34] dark:bg-orange-500/10 dark:text-orange-300"
                : "bg-[#e9f1ff] text-[#3e6fb1] dark:bg-blue-500/10 dark:text-blue-300"
            }`}
          >
            <ResourceFileIcon fileType={resource.fileType} />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#e4ebe8] bg-[#f7f9f8] px-2.5 py-1.5 text-[11px] font-semibold text-gray-600 dark:border-white/10 dark:bg-white/5">
                {resource.courseCode}
              </span>
              <span className="hidden text-xs text-gray-400 md:inline">{resource.courseTitle}</span>
            </div>
            <h2 className="mt-4 text-base font-semibold leading-6 text-gray-900">
              {resource.title}
            </h2>
            {resource.description && (
              <p className="mt-2 hidden line-clamp-2 text-sm leading-6 text-gray-600 md:block">
                {resource.description}
              </p>
            )}
          </div>
        </div>

        <a
          aria-label="Yüklə"
          className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#e9f1ff] text-[#3e6fb1] transition-all duration-200 active:scale-95 hover:bg-[#dce9ff] dark:bg-blue-500/10 dark:text-blue-300"
          download
          href={downloadUrl}
        >
          <Download className="size-4" />
        </a>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[#edf1ef] pt-4 text-xs text-gray-500 dark:border-white/10">
        <div className="flex min-w-0 items-center gap-2">
          <HardDrive className="size-3.5 shrink-0 text-gray-400" />
          <span className="max-w-[180px] truncate font-medium text-gray-700 dark:text-gray-300">{resource.fileName}</span>
          <span className="text-gray-400">· {formatFileSize(resource.fileSizeBytes)}</span>
        </div>
        <div className="flex items-center gap-2">
          <UserRound className="size-3.5 text-gray-400" />
          <span>{resource.uploaderName}</span>
        </div>
        <div className="flex items-center gap-2 text-[#0e7a65] dark:text-teal-300 sm:ml-auto">
          <CalendarDays className="size-3.5" />
          <span className="font-medium">{formatResourceDate(resource.createdAt)}</span>
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
  const pdfResourceCount = sortedResources.filter(
    (resource) => resource.fileType === "pdf",
  ).length;

  function handleResourceCreated(resource: ResourceItem) {
    setResources((currentResources) => [resource, ...currentResources]);
  }

  return (
    <div className="space-y-6">
      <header className="space-y-4 lg:flex lg:items-end lg:justify-between lg:space-y-0">
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#e9f1ff] text-[#3e6fb1] dark:bg-blue-500/10 dark:text-blue-300">
            <FolderOpen className="size-5" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">Bilik kitabxanası</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-normal text-gray-900 md:text-3xl">
              Materiallar
            </h1>
            <p className="mt-1 text-xs text-gray-500">
              {sortedResources.length} material • {pdfResourceCount} PDF
            </p>
          </div>
        </div>

        <label className="relative block w-full max-w-full md:w-[420px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            className="app-card min-h-[50px] w-full rounded-2xl bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#80bcae] focus:ring-0"
            placeholder="Bu bölmədə material və ya fayl axtar"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </header>

      <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="min-w-0 space-y-4">
          <div className="scrollbar-none flex gap-3 overflow-x-auto pb-1">
            <button
              className={`min-h-[44px] shrink-0 rounded-full border px-4 text-xs font-semibold transition-all duration-200 ${
                selectedCourseId === "all"
                  ? "border-[#abc8ed] bg-[#e9f1ff] text-[#3e6fb1] dark:bg-blue-500/10 dark:text-blue-300"
                  : "border-[#e1e9e6] bg-white text-gray-600 hover:border-[#b9cce4]"
              }`}
              type="button"
              onClick={() => setSelectedCourseId("all")}
            >
              Bütün fənlər
            </button>
            {courses.map((course) => (
              <button
                className={`min-h-[44px] shrink-0 rounded-full border px-4 text-xs font-semibold transition-all duration-200 ${
                  selectedCourseId === course.id
                    ? "border-[#abc8ed] bg-[#e9f1ff] text-[#3e6fb1] dark:bg-blue-500/10 dark:text-blue-300"
                    : "border-[#e1e9e6] bg-white text-gray-600 hover:border-[#b9cce4]"
                }`}
                key={course.id}
                type="button"
                onClick={() => setSelectedCourseId(course.id)}
              >
                {course.code}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            {fileTypeFilters.map((filter) => (
              <button
                className={`min-h-[44px] rounded-full border px-4 text-xs font-semibold transition-all duration-200 ${
                  selectedFileType === filter.value
                    ? "border-[#9dd1c4] bg-[#e7f5f0] text-[#0e705e] dark:bg-teal-500/10 dark:text-teal-300"
                    : "border-[#e1e9e6] bg-white text-gray-600 hover:border-[#bcd8d0]"
                }`}
                key={filter.value}
                type="button"
                onClick={() => setSelectedFileType(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div aria-busy={isLoading} className="stagger-grid grid gap-4">
            {isLoading ? <ContentSkeleton count={3} compact /> : sortedResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>

          {!isLoading && sortedResources.length === 0 && (
            <div className="app-card rounded-3xl p-8 text-center">
              <FolderOpen className="mx-auto size-6 text-teal-700" />
              <p className="mt-3 text-sm font-semibold text-gray-900">Material tapılmadı</p>
              <p className="mt-1 text-sm text-gray-500">Başqa fənn və ya fayl adı ilə axtar.</p>
              <button
                className="mx-auto mt-5 flex min-h-[44px] items-center justify-center rounded-2xl bg-gray-900 px-5 text-sm font-semibold text-white"
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCourseId("all");
                  setSelectedFileType("all");
                  document.getElementById("resource-upload-form")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                İlk materialı sən paylaş
              </button>
            </div>
          )}
        </div>

        <aside className="min-w-0 max-w-full space-y-4">
          <ResourceUploadForm courses={courses} onResourceCreated={handleResourceCreated} />
        </aside>
      </section>
    </div>
  );
}
