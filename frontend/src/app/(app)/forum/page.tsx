import type { Metadata } from "next";

import { ForumBoard } from "@/components/forum-board";

export const metadata: Metadata = {
  title: "Sual-cavab forumu | EduRate",
  description: "Fənlər üzrə sual ver, tələbələrin cavablarını oxu və faydalı cavablara səs ver.",
};

export default function ForumPage() {
  return <ForumBoard />;
}
