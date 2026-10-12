"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { resetPassword } from "@/services/api/auth";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";

const MIN_PASSWORD_LENGTH = 12;

export default function ResetPasswordForm({
  token,
  invalidToken = false,
}: {
  token: string;
  invalidToken?: boolean;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(
    invalidToken || !token
      ? "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn."
      : null,
  );
  const [complete, setComplete] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Mật khẩu cần có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`);
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await resetPassword(token, password);
      setComplete(true);
    } catch {
      setError(
        "Không thể đặt lại mật khẩu. Liên kết có thể đã hết hạn; hãy yêu cầu liên kết mới.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (complete) {
    return (
      <div role="status" className="space-y-4 text-center">
        <p className="text-[13px] leading-5 text-text-secondary">
          Mật khẩu đã được cập nhật.
        </p>
        <Link
          className="inline-block text-[13px] font-medium text-text-primary underline"
          href="/login"
        >
          Đăng nhập
        </Link>
      </div>
    );
  }

  if (invalidToken || !token) {
    return (
      <div className="space-y-4 text-center">
        <p role="alert" className="text-[13px] leading-5 text-input-error">
          {error}
        </p>
        <Link
          className="inline-block text-[13px] font-medium text-text-primary underline"
          href="/forgot-password"
        >
          Yêu cầu liên kết mới
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
        htmlFor="new-password"
      >
        Mật khẩu mới
      </label>
      <Input
        id="new-password"
        className="mb-4 w-full rounded-lg border-card-border bg-background-gray-primary px-3.5 py-3 text-[14px] text-text-primary focus:border-input-primary-focus-border focus:bg-card-background focus:ring-input-primary-focus-border/20"
        type="password"
        name="password"
        autoComplete="new-password"
        minLength={MIN_PASSWORD_LENGTH}
        required
      />
      <label
        className="mb-2 block text-[13px] font-medium text-input-label-text-color"
        htmlFor="confirm-password"
      >
        Xác nhận mật khẩu mới
      </label>
      <Input
        id="confirm-password"
        className="mb-4 w-full rounded-lg border-card-border bg-background-gray-primary px-3.5 py-3 text-[14px] text-text-primary focus:border-input-primary-focus-border focus:bg-card-background focus:ring-input-primary-focus-border/20"
        type="password"
        name="confirmPassword"
        autoComplete="new-password"
        minLength={MIN_PASSWORD_LENGTH}
        required
      />
      <Button
        type="submit"
        isDisabled={submitting}
        aria-disabled={submitting}
        className="h-12 w-full rounded-lg py-3 text-[14px] leading-4"
      >
        {submitting ? "Đang cập nhật…" : "Cập nhật mật khẩu"}
      </Button>
    </form>
  );
}
