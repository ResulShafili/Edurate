import type { Metadata } from "next";

import { AuthFrame } from "@/components/auth-frame";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Giriş | EduRate",
  description: "EduRate kampus hesabına universitet emailinlə daxil ol.",
};

export default function LoginPage() {
  return (
    <AuthFrame eyebrow="Xoş gəlmisən" title="Hesabına daxil ol">
      <AuthForm mode="login" />
    </AuthFrame>
  );
}
