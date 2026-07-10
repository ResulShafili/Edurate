import { mockCourses } from "@/lib/forum";
import type { ForumCourse } from "@/lib/forum";

export type ResourceCourse = ForumCourse;

export type ResourceFileType = "pdf" | "image";

export type ResourceItem = {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  title: string;
  description: string | null;
  fileName: string;
  fileType: ResourceFileType;
  fileUrl: string;
  fileSizeBytes: number;
  isAnonymous: boolean;
  uploaderName: string;
  createdAt: string;
};

export const resourcesApiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "";

export const mockResourceCourses = mockCourses;

export const mockResources: ResourceItem[] = [
  {
    id: "res-1",
    courseId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    courseCode: "CS201",
    courseTitle: "Data Structures",
    title: "Final üçün Tree və Graph konspekti",
    description: "Traversal, BFS/DFS və priority queue mövzuları bir sənəddə.",
    fileName: "cs201-tree-graph-final.pdf",
    fileType: "pdf",
    fileUrl: "#",
    fileSizeBytes: 2140000,
    isAnonymous: true,
    uploaderName: "Anonim tələbə",
    createdAt: "2026-06-28T11:00:00.000Z",
  },
  {
    id: "res-2",
    courseId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    courseCode: "SE240",
    courseTitle: "Databases",
    title: "Normalization cheat sheet",
    description: "1NF, 2NF, 3NF və BCNF fərqləri üçün qısa vizual xülasə.",
    fileName: "normalization-cheatsheet.png",
    fileType: "image",
    fileUrl: "#",
    fileSizeBytes: 860000,
    isAnonymous: true,
    uploaderName: "Anonim tələbə",
    createdAt: "2026-05-14T15:20:00.000Z",
  },
  {
    id: "res-3",
    courseId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
    courseCode: "WEB210",
    courseTitle: "React Fundamentals",
    title: "Hooks praktiki nümunələri",
    description: "useState, useEffect və custom hook tapşırıqları.",
    fileName: "react-hooks-practice.pdf",
    fileType: "pdf",
    fileUrl: "#",
    fileSizeBytes: 1320000,
    isAnonymous: false,
    uploaderName: "Səbinə",
    createdAt: "2026-04-03T18:40:00.000Z",
  },
];

export function formatResourceDate(value: string) {
  const date = new Date(value);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

export function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 KB";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.ceil(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function resolveResourceUrl(fileUrl: string) {
  if (!fileUrl || fileUrl === "#") {
    return "#";
  }

  if (/^https?:\/\//i.test(fileUrl)) {
    return fileUrl;
  }

  return resourcesApiBaseUrl ? `${resourcesApiBaseUrl}${fileUrl}` : fileUrl;
}
