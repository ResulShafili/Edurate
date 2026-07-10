import type { Metadata } from "next";

import { ResourcesBoard } from "@/components/resources-board";

export const metadata: Metadata = {
  title: "Dərs materialları | EduRate",
  description: "Fənn üzrə PDF konspektləri və şəkil materiallarını tap, yüklə və tələbələrlə paylaş.",
};

export default function ResourcesPage() {
  return <ResourcesBoard />;
}
