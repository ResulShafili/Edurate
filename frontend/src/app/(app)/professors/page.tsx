import type { Metadata } from "next";

import { ProfessorsDirectory } from "@/components/professors-directory";

export const metadata: Metadata = {
  title: "Müəllim qiymətləndirmələri | EduRate",
  description: "Qarabağ Universiteti müəllimlərini fənn üzrə tap və strukturlaşdırılmış tələbə qiymətləndirmələrinə bax.",
};

export default function ProfessorsPage() {
  return <ProfessorsDirectory />;
}
