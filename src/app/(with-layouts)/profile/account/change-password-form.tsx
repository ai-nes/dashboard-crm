"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { changePassword } from "@/services/api/auth";
import { NestApiError } from "@/services/api/nest/nest-client";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import PasswordField from "./password-field";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  validatePasswordChange,
} from "./change-password-validation";

function passwordError(error: unknown): string {
  if (error instanceof NestApiError) {
    if (error.code === "INVALID_PASSWORD")
      return "Mật khẩu hiện tại không đúng.";
    if (error.code === "CREDENTIAL_ACCOUNT_NOT_FOUND")
      return "Tài khoản này chưa có mật khẩu để thay đổi.";
    if (
      error.code === "PASSWORD_TOO_SHORT" ||
      error.code === "PASSWORD_TOO_LONG"
    )
      return "Mật khẩu mới cần có từ 6 đến 128 ký tự.";
    if (error.status === 401)
      return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
    if (error.status === 429)
      return "Bạn thử quá nhiều lần. Vui lòng đợi rồi thử lại.";
  }
  return "Không thể đổi mật khẩu. Vui lòng thử lại.";
}

export default function ChangePasswordForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const [formVersion, setFormVersion] = useState(0);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const form = new FormData(event.currentTarget);
    const currentPassword = String(form.get("currentPassword") ?? "");
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    const validationError = validatePasswordChange(
      currentPassword,
      newPassword,
      confirmPassword,
    );
    setError(validationError);
    setComplete(false);
    if (validationError) return;
    setSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      setFormVersion((value) => value + 1);
      setComplete(true);
      toast.success("Đã đổi mật khẩu.");
    } catch (cause) {
      setError(passwordError(cause));
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Card className="bg-transparent p-5">
      <h2 className="text-xl leading-7 font-semibold text-text-primary">
        Đổi mật khẩu
      </h2>
      <p className="mt-2 text-sm text-text-secondary">
        Mật khẩu mới từ 6 đến 128 ký tự. Sau khi đổi, các phiên đăng nhập khác
        sẽ được đăng xuất.
      </p>
      <form key={formVersion} onSubmit={submit} className="mt-6 space-y-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2 md:max-w-[calc(50%-0.625rem)]">
            <PasswordField
              name="currentPassword"
              label="Mật khẩu hiện tại"
              autoComplete="current-password"
              disabled={submitting}
            />
          </div>
          <PasswordField
            name="newPassword"
            label="Mật khẩu mới"
            autoComplete="new-password"
            minLength={PASSWORD_MIN_LENGTH}
            maxLength={PASSWORD_MAX_LENGTH}
            disabled={submitting}
          />
          <PasswordField
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            autoComplete="new-password"
            minLength={PASSWORD_MIN_LENGTH}
            maxLength={PASSWORD_MAX_LENGTH}
            disabled={submitting}
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-error-500">
            {error}
          </p>
        )}
        {complete && (
          <p role="status" className="text-sm text-success-600">
            Đã đổi mật khẩu thành công.
          </p>
        )}
        <Button type="submit" isDisabled={submitting}>
          {submitting ? "Đang cập nhật…" : "Đổi mật khẩu"}
        </Button>
      </form>
    </Card>
  );
}
