import { AuthFrame } from "@/components/auth-frame";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <AuthFrame eyebrow="Xoş gəlmisən" title="Hesabına daxil ol">
      <AuthForm mode="login" />
    </AuthFrame>
  );
}
