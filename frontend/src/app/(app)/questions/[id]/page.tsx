import { QuestionThread } from "@/components/question-thread";

export default async function QuestionThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <QuestionThread questionId={id} />;
}
