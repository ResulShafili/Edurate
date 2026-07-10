import type { Metadata } from "next";

import { QuestionThread } from "@/components/question-thread";
import {
  getMockQuestion,
  getQuestionSlug,
  mockQuestions,
} from "@/lib/forum";

type QuestionPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return mockQuestions.map((question) => ({
    slug: getQuestionSlug(question),
  }));
}

export async function generateMetadata({ params }: QuestionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const question = getMockQuestion(slug);

  return {
    title: question ? `${question.title} | EduRate Forum` : "Forum mövzusu | EduRate",
    description: question?.body.slice(0, 150) || "EduRate fənn forumunda sual və cavablar.",
  };
}

export default async function QuestionThreadPage({ params }: QuestionPageProps) {
  const { slug } = await params;

  return <QuestionThread questionSlug={slug} />;
}
