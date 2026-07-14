import type { Metadata } from "next";

import { ProfessorProfile } from "@/components/professor-profile";
import {
  getMockProfessor,
  getProfessorSlug,
  mockProfessors,
} from "@/lib/professors";

type ProfessorPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return mockProfessors.map((professor) => ({
    slug: getProfessorSlug(professor),
  }));
}

export async function generateMetadata({ params }: ProfessorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const professor = getMockProfessor(slug);

  if (!professor) {
    return {
      title: "Müəllim profili | EduRate",
      description: "Müəllim və fənn üzrə strukturlaşdırılmış tələbə qiymətləndirmələri.",
    };
  }

  const primaryCourse = professor.courses[0]?.title;

  return {
    title: `${professor.fullName}${primaryCourse ? ` — ${primaryCourse}` : ""} | EduRate`,
    description: `${professor.fullName} üçün izah, obyektivlik, dərs balansı və ümumi tövsiyə nəticələri.`,
  };
}

export default async function ProfessorProfilePage({ params }: ProfessorPageProps) {
  const { slug } = await params;

  return <ProfessorProfile professorSlug={slug} />;
}
