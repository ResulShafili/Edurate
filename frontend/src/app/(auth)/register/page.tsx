import { AuthFrame } from "@/components/auth-frame";
import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <AuthFrame eyebrow="EduRate hesabı" title="Universitet emaili ilə qeydiyyat">
      <AuthForm mode="register" />
    </AuthFrame>
  );
}
