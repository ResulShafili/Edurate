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
    <div className="mx-auto w-full max-w-[440px] rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{copy.title}</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">{copy.description}</p>
        </div>
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
          {mode === "login" ? <LockKeyhole className="size-5" /> : <School className="size-5" />}
        </div>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        {mode === "register" && (
          <>
            <Field icon={User} label="Ad soyad" name="fullName" placeholder="Resul Shafili" />
            <Field icon={AtSign} label="İstifadəçi adı" name="username" placeholder="resul" required={false} />
            <UniversitySelect />
          </>
        )}

        <Field icon={Mail} label="Universitet emaili" name="email" placeholder="name@karabakh.edu.az" type="email" />

        <label className="block">
          <span className="text-xs font-medium text-gray-500">Şifrə</span>
          <span className="mt-2 flex min-h-[44px] items-center rounded-2xl border border-gray-200 bg-slate-50 px-4 focus-within:border-gray-400 focus-within:ring-0">
            <LockKeyhole className="mr-2 size-4 text-gray-400" />
            <input
              className="min-h-[44px] min-w-0 flex-1 bg-slate-50 text-sm text-gray-900 outline-none placeholder:text-gray-400"
              minLength={8}
              name="password"
              placeholder="Minimum 8 simvol"
              required
              type={showPassword ? "text" : "password"}
            />
            <button
              aria-label={showPassword ? "Şifrəni gizlət" : "Şifrəni göstər"}
              className="flex size-11 items-center justify-center rounded-2xl text-gray-400 transition hover:bg-slate-50 hover:text-gray-900"
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
            className={`rounded-2xl border px-4 py-3 text-xs ${
              status === "success"
                ? "border-teal-100 bg-teal-50 text-teal-700"
                : "border-orange-100 bg-orange-50 text-orange-700"
            }`}
          >
            {message}
          </p>
        )}

        <button
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 text-sm font-semibold text-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 md:hover:-translate-y-0.5 md:hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
          disabled={status === "loading"}
          type="submit"
        >
          {status === "loading" ? "Gözləyin" : copy.submit}
          <ArrowRight className="size-4" />
        </button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm text-gray-500">
        <span>{copy.alternateText}</span>
        <Link className="inline-flex min-h-[44px] items-center font-semibold text-gray-900 hover:underline" href={copy.alternateHref}>
          {copy.alternateAction}
        </Link>
      </div>
    </div>
  );
}

function UniversitySelect() {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-500">Universitetini seç</span>
      <span className="relative mt-2 flex min-h-[44px] items-center rounded-2xl border border-gray-200 bg-slate-50 px-4 focus-within:border-gray-400 focus-within:ring-0">
        <School className="mr-2 size-4 text-gray-400" />
        <select
          className="min-h-[44px] min-w-0 flex-1 appearance-none bg-slate-50 pr-7 text-sm text-gray-900 outline-none"
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
        <ChevronDown className="pointer-events-none absolute right-4 size-4 text-gray-400" />
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
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <span className="mt-2 flex min-h-[44px] items-center rounded-2xl border border-gray-200 bg-slate-50 px-4 focus-within:border-gray-400 focus-within:ring-0">
        <Icon className="mr-2 size-4 text-gray-400" />
        <input
          className="min-h-[44px] min-w-0 flex-1 bg-slate-50 text-sm text-gray-900 outline-none placeholder:text-gray-400"
          name={name}
          placeholder={placeholder}
          required={required}
          type={type}
        />
      </span>
    </label>
  );
}
