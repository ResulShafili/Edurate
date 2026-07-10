import type { Metadata } from "next";

import { ProfessorsDirectory } from "@/components/professors-directory";

export const metadata: Metadata = {
  title: "Müəllim rəyləri | EduRate",
  description: "Qarabağ Universiteti müəllimlərini fənn üzrə tap, reytinqləri müqayisə et və tələbə rəylərini oxu.",
};

export default function ProfessorsPage() {
  return <ProfessorsDirectory />;
}
