import type { MetadataRoute } from "next";

import { getQuestionSlug, mockQuestions } from "@/lib/forum";
import { getProfessorSlug, mockProfessors } from "@/lib/professors";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://edurate-eight.vercel.app";
  const staticRoutes = ["", "/professors", "/forum", "/resources", "/login", "/register"];

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      changeFrequency: route === "" ? ("daily" as const) : ("weekly" as const),
      priority: route === "" ? 1 : 0.8,
    })),
    ...mockProfessors.map((professor) => ({
      url: `${siteUrl}/professors/${getProfessorSlug(professor)}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...mockQuestions.map((question) => ({
      url: `${siteUrl}/forum/${getQuestionSlug(question)}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];
}
