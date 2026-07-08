"use client";

import {
  Download,
  FileImage,
  FileText,
  FolderOpen,
  Search,
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
    <article className="group rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 md:hover:-translate-y-1 md:hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-4">
          <span
            className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${
              resource.fileType === "pdf"
                ? "bg-orange-50 text-orange-600"
                : "bg-teal-50 text-teal-700"
            }`}
          >
            <ResourceFileIcon fileType={resource.fileType} />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-2xl bg-slate-50 px-3 py-2 text-xs font-semibold text-gray-600">
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
          className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-gray-500 transition-all duration-300 md:hover:-translate-y-0.5 md:hover:text-gray-900 md:hover:shadow-md"
          download
          href={downloadUrl}
        >
          <Download className="size-4" />
        </a>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs text-gray-500">
          <p className="truncate font-medium text-gray-900">{resource.fileName}</p>
          <p className="mt-1">{formatFileSize(resource.fileSizeBytes)}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs text-gray-500">
          <p>Yükləyən</p>
          <p className="mt-1 font-medium text-gray-900">{resource.uploaderName}</p>
        </div>
        <div className="rounded-2xl bg-teal-50 px-4 py-3 text-xs text-teal-700">
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
  const pdfResourceCount = sortedResources.filter(
    (resource) => resource.fileType === "pdf",
  ).length;

  function handleResourceCreated(resource: ResourceItem) {
    setResources((currentResources) => [resource, ...currentResources]);
  }

  return (
    <div className="space-y-6">
      <header className="space-y-4 md:flex md:items-end md:justify-between md:space-y-0">
        <div>
          <p className="hidden text-xs font-medium uppercase tracking-[0.16em] text-gray-400 md:block">
            Modul D · Resources
          </p>
          <h1 className="text-2xl font-semibold tracking-normal text-gray-900 md:mt-1 md:text-3xl">
            Materiallar
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {sortedResources.length} material • {pdfResourceCount} PDF
          </p>
        </div>

        <label className="relative block w-full md:w-[420px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            className="min-h-[48px] w-full rounded-2xl border border-gray-200 bg-slate-50 pl-11 pr-4 text-sm text-gray-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] outline-none transition focus:border-gray-400 focus:ring-0"
            placeholder="Material, fənn və ya fayl adı axtar"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </header>

      <section className="grid gap-6 xl:grid-cols-[1fr_390px]">
        <div className="space-y-4">
          <div className="flex gap-3 overflow-x-auto pb-1">
            <button
              className={`min-h-[44px] shrink-0 rounded-2xl px-4 text-xs font-semibold transition-all duration-300 md:hover:-translate-y-0.5 md:hover:shadow-md ${
                selectedCourseId === "all"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              }`}
              type="button"
              onClick={() => setSelectedCourseId("all")}
            >
              Bütün fənlər
            </button>
            {courses.map((course) => (
              <button
                className={`min-h-[44px] shrink-0 rounded-2xl px-4 text-xs font-semibold transition-all duration-300 md:hover:-translate-y-0.5 md:hover:shadow-md ${
                  selectedCourseId === course.id
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
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
                className={`min-h-[44px] rounded-2xl px-4 text-xs font-semibold transition-all duration-300 md:hover:-translate-y-0.5 md:hover:shadow-md ${
                  selectedFileType === filter.value
                    ? "bg-teal-50 text-teal-700"
                    : "bg-white text-gray-600 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                }`}
                key={filter.value}
                type="button"
                onClick={() => setSelectedFileType(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="grid gap-4">
            {sortedResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>

          {sortedResources.length === 0 && (
            <div className="rounded-3xl bg-white p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <FolderOpen className="mx-auto size-6 text-teal-700" />
              <p className="mt-3 text-sm font-semibold text-gray-900">Material tapılmadı</p>
              <p className="mt-1 text-sm text-gray-500">Başqa fənn və ya fayl adı ilə axtar.</p>
            </div>
          )}

          {isLoading && (
            <p className="text-center text-xs font-medium text-gray-400">Yenilənir...</p>
          )}
        </div>

        <aside className="space-y-4">
          <ResourceUploadForm courses={courses} onResourceCreated={handleResourceCreated} />
        </aside>
      </section>
    </div>
  );
}
