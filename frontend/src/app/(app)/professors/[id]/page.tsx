import { ProfessorProfile } from "@/components/professor-profile";

export default async function ProfessorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ProfessorProfile professorId={id} />;
}
