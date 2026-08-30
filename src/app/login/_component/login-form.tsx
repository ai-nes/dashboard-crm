"use client";

import {
  AUTH_QUERY_KEY,
  useAuth,
} from "@/components/common/auth/auth-provider";
import { loginWithPassword } from "@/services/api/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const FRAPPE_URL = (
  process.env.NEXT_PUBLIC_FRAPPE_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

// Field wrapper — mirrors `.field-inner` in crm/www/login.html.
const fieldInner =
  "flex items-center rounded-[8px] border border-[#e5e7eb] bg-[#fafafa] px-3.5 transition-colors focus-within:border-[#6b7280] focus-within:bg-white";
const fieldInput =
  "min-w-0 flex-1 border-none bg-transparent py-3 text-[14px] leading-4 text-[#111] outline-none placeholder:text-[#9ca3af]";

/** Email/password sign-in — a faithful port of the Frappe CRM login form. */
export function LoginForm() {
  const { user, refetch } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already signed in (e.g. via Google) → don't sit on the login screen.
  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const usr = String(form.get("usr") ?? "").trim();
    const pwd = String(form.get("pwd") ?? "");

    setError(null);
    setSubmitting(true);
    const result = await loginWithPassword(usr, pwd);
    if (!result.ok) {
      setError(result.error ?? "Đăng nhập thất bại.");
      setSubmitting(false);
      return;
    }

    await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    refetch();
    router.replace("/");
  };

  return (
    <form onSubmit={handleSubmit}>
      {error ? (
        <div
          role="alert"
          className="mb-3.5 rounded-[8px] border border-[#fecaca] bg-[#fef2f2] px-3.5 py-2.5 text-[13px] text-[#dc2626]"
        >
          {error}
        </div>
      ) : null}

      <div className="mb-3.5">
        <div className={fieldInner}>
          <svg
            className="mr-2.5 shrink-0 text-[#9ca3af]"
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <input
            className={fieldInput}
            type="text"
            name="usr"
            autoComplete="username"
            placeholder="jane@example.com / Administrator"
            aria-label="Email hoặc tên đăng nhập"
            required
          />
        </div>
      </div>

      <div className="mb-4">
        <div className={fieldInner}>
          <svg
            className="mr-2.5 shrink-0 text-[#9ca3af]"
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <input
            className={fieldInput}
            type={showPwd ? "text" : "password"}
            name="pwd"
            autoComplete="current-password"
            placeholder="••••••"
            aria-label="Mật khẩu"
            required
          />
          <button
            type="button"
            onClick={() => setShowPwd((value) => !value)}
            className="shrink-0 cursor-pointer border-none bg-transparent p-0 pl-2 text-[13px] text-[#6b7280]"
          >
            {showPwd ? "Ẩn" : "Hiện"}
          </button>
        </div>
      </div>

      <div className="mb-4 text-right">
        <a
          href={`${FRAPPE_URL}/update-password`}
          className="text-[13px] text-[#6b7280] no-underline hover:text-[#111]"
        >
          Quên mật khẩu?
        </a>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full cursor-pointer rounded-[8px] border-none bg-[#111] py-3 text-[14px] leading-4 font-medium text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Đang đăng nhập…" : "Đăng nhập"}
      </button>
    </form>
  );
}
