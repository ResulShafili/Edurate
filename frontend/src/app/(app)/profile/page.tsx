import type { Metadata } from "next";

import { ProfileOverview } from "@/components/profile-overview";

export const metadata: Metadata = {
  title: "Profil | EduRate",
  description: "EduRate hesabı və şəxsi kampus aktivliyi.",
};

export default function ProfilePage() {
  return <ProfileOverview />;
}
