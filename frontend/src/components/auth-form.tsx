"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  AtSign,
  ChevronDown,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  School,
  User,
} from "lucide-react";
import Link from "next/link";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

type AuthMode = "login" | "register";

type AuthResponse = {
  message?: string;
  token?: string;
  errors?: string[];
  user?: {
    fullName?: string;
    email?: string;
    username?: string;
  };
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const universities = [
  {
    name: "Qarabağ Universiteti",
    domain: "karabakh.edu.az",
  },
] as const;

function emailMatchesDomain(email: string, domain: string) {
  const emailDomain = email.split("@").pop();

  return emailDomain === domain || emailDomain?.endsWith(`.${domain}`);
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const copy = useMemo(
    () =>
      mode === "login"
        ? {
            title: "Giriş",
            description: "Kampus hesabına universitet emailinlə daxil ol.",
            submit: "Daxil ol",
            alternateText: "Hesabın yoxdur?",
            alternateAction: "Qeydiyyat",
            alternateHref: "/register",
          }
        : {
            title: "Qeydiyyat",
            description: "Universitetini seç və rəsmi emailinlə hesab yarat.",
            submit: "Hesab yarat",
            alternateText: "Artıq hesabın var?",
            alternateAction: "Giriş",
            alternateHref: "/login",
          },
    [mode],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const universityDomain = String(formData.get("universityDomain") || universities[0].domain);

    if (mode === "register" && !emailMatchesDomain(email, universityDomain)) {
      setStatus("error");
      setMessage(`Zəhmət olmasa @${universityDomain} emailindən istifadə et.`);
      return;
    }

    const payload =
      mode === "login"
        ? {
            email,
            password: formData.get("password"),
          }
        : {
            fullName: formData.get("fullName"),
            username: formData.get("username"),
            universityDomain,
            email,
            password: formData.get("password"),
          };

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/auth/${mode === "login" ? "login" : "register"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
      const data = (await response.json()) as AuthResponse;

      if (!response.ok) {
        throw new Error(data.errors?.join(", ") || data.message || "Sorğu tamamlanmadı");
      }

      if (data.token) {
        window.localStorage.setItem("edurate_token", data.token);
      }

      if (data.user) {
        window.localStorage.setItem("edurate_user", JSON.stringify(data.user));
      }

      window.dispatchEvent(new Event("edurate-auth-change"));
      setStatus("success");
      setMessage(data.message || "Uğurlu əməliyyat");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Server ilə əlaqə alınmadı");
    }
  }

  return (
    <div className="mx-auto w-full max-w-[440px] rounded-lg border border-white/70 bg-white/84 p-4 shadow-[0_22px_60px_rgba(39,35,29,0.12)] backdrop-blur-xl sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{copy.title}</h2>
          <p className="mt-1 text-sm leading-5 text-muted">{copy.description}</p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#eef6f1] text-sage">
          {mode === "login" ? <LockKeyhole className="size-5" /> : <School className="size-5" />}
        </div>
      </div>

      <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
        {mode === "register" && (
          <>
            <Field icon={User} label="Ad soyad" name="fullName" placeholder="Resul Shafili" />
            <Field icon={AtSign} label="İstifadəçi adı" name="username" placeholder="resul" required={false} />
            <UniversitySelect />
          </>
        )}

        <Field icon={Mail} label="Universitet emaili" name="email" placeholder="name@karabakh.edu.az" type="email" />

        <label className="block">
          <span className="text-xs font-medium text-muted">Şifrə</span>
          <span className="mt-1 flex h-11 items-center rounded-lg border border-line bg-white px-3 focus-within:border-sage">
            <LockKeyhole className="mr-2 size-4 text-muted" />
            <input
              className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#aaa49b]"
              minLength={8}
              name="password"
              placeholder="Minimum 8 simvol"
              required
              type={showPassword ? "text" : "password"}
            />
            <button
              aria-label={showPassword ? "Şifrəni gizlət" : "Şifrəni göstər"}
              className="flex size-8 items-center justify-center rounded-lg text-muted transition hover:bg-[#f4f3ef] hover:text-foreground"
              title={showPassword ? "Şifrəni gizlət" : "Şifrəni göstər"}
              type="button"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </span>
        </label>

        {message && (
          <p
            className={`rounded-lg border px-3 py-2 text-xs ${
              status === "success"
                ? "border-[#cfe3d7] bg-[#f0f8f3] text-[#3f6f58]"
                : "border-[#efd4ca] bg-[#fff4ef] text-[#9b4d37]"
            }`}
          >
            {message}
          </p>
        )}

        <button
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(38,52,47,0.18)] transition hover:bg-[#1f2b27] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={status === "loading"}
          type="submit"
        >
          {status === "loading" ? "Gözləyin" : copy.submit}
          <ArrowRight className="size-4" />
        </button>
      </form>

      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted">
        <span>{copy.alternateText}</span>
        <Link className="font-semibold text-ink hover:underline" href={copy.alternateHref}>
          {copy.alternateAction}
        </Link>
      </div>
    </div>
  );
}

function UniversitySelect() {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted">Universitetini seç</span>
      <span className="relative mt-1 flex h-11 items-center rounded-lg border border-line bg-white px-3 focus-within:border-sage">
        <School className="mr-2 size-4 text-muted" />
        <select
          className="h-full min-w-0 flex-1 appearance-none bg-transparent pr-7 text-sm outline-none"
          defaultValue={universities[0].domain}
          name="universityDomain"
          required
        >
          {universities.map((university) => (
            <option key={university.domain} value={university.domain}>
              {university.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 size-4 text-muted" />
      </span>
    </label>
  );
}

function Field({
  icon: Icon,
  label,
  name,
  placeholder,
  required = true,
  type = "text",
}: {
  icon: LucideIcon;
  label: string;
  name: string;
  placeholder: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted">{label}</span>
      <span className="mt-1 flex h-11 items-center rounded-lg border border-line bg-white px-3 focus-within:border-sage">
        <Icon className="mr-2 size-4 text-muted" />
        <input
          className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#aaa49b]"
          name={name}
          placeholder={placeholder}
          required={required}
          type={type}
        />
      </span>
    </label>
  );
}
