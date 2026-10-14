"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { requestPasswordReset } from "@/services/api/auth";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";

export default function ForgotPasswordForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    setError(null);
    setSubmitting(true);
    try {
      await requestPasswordReset(
        email,
        `${window.location.origin}/reset-password`,
      );
      setSent(true);
    } catch {
      setError("Không thể gửi yêu cầu. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div role="status" className="space-y-4 text-center">
        <p className="text-[13px] leading-5 text-text-secondary">
          Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu sẽ được
          gửi đến hộp thư đó.
        </p>
        <Link
          className="inline-block text-[13px] font-medium text-text-primary underline"
          href="/login"
        >
          Quay lại đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      {error ? (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-input-error-focus-border/30 bg-input-error-focus-border/10 px-3.5 py-2.5 text-[13px] text-input-error"
        >
          {error}
        </div>
      ) : null}
      <label
        className="mb-2 block text-[13px] font-medium text-input-label-text-color"
        htmlFor="reset-email"
      >
        Email
      </label>
      <Input
        id="reset-email"
        className="mb-4 w-full rounded-lg border-card-border bg-background-gray-primary px-3.5 py-3 text-[14px] text-text-primary focus:border-input-primary-focus-border focus:bg-card-background focus:ring-input-primary-focus-border/20"
        type="email"
        name="email"
        autoComplete="email"
        required
      />
      <Button
        type="submit"
        isDisabled={submitting}
        aria-disabled={submitting}
        className="h-12 w-full rounded-lg py-3 text-[14px] leading-4"
      >
        {submitting ? "Đang gửi…" : "Gửi liên kết đặt lại"}
      </Button>
      <p className="mt-3 text-center text-[12px] leading-5 text-text-tertiary">
        Sau khi gửi, thông báo sẽ giống nhau để bảo vệ thông tin tài khoản.
      </p>
      <div className="mt-5 text-center">
        <Link
          className="text-[13px] font-medium text-text-secondary underline"
          href="/login"
        >
          Quay lại đăng nhập
        </Link>
      </div>
    </form>
  );
}
