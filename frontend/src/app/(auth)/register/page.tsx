import type { Metadata } from "next";

import { AuthFrame } from "@/components/auth-frame";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Qeydiyyat | EduRate",
  description: "Qarabağ Universitetinin rəsmi emaili ilə təhlükəsiz EduRate hesabı yarat.",
};

export default function RegisterPage() {
  return (
    <AuthFrame eyebrow="EduRate hesabı" title="Universitet emaili ilə qeydiyyat">
      <AuthForm mode="register" />
    </AuthFrame>
  );
}
