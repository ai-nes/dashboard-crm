"use client";

import {
  Alert,
  AlertContent,
  AlertDescription,
} from "@/components/tailgrids/core/alert";
import { Button } from "@/components/tailgrids/core/button";
import { loginWithPassword } from "@/services/api/auth";
import {
  LICENSE_QUERY_KEY,
  activateLicense,
  activationErrorMessage,
} from "@/services/api/license";
import { NestApiError } from "@/services/api/nest/nest-client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { FormTextField } from "./form-text-field";

const ADMIN_LOGIN_REQUIRED =
  "Cần đăng nhập tài khoản quản trị viên để kích hoạt license.";

/**
 * Sends the key to crm-backend, which checks it with the License Hub. Only an
 * administrator may activate, so a missing session reveals the sign-in fields.
 */
export function ActivateForm() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [needsLogin, setNeedsLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const form = new FormData(event.currentTarget);
    const licenseKey = String(form.get("licenseKey") ?? "").trim();

    setError(null);
    setSubmitting(true);

    try {
      if (needsLogin) {
        const login = await loginWithPassword(
          String(form.get("email") ?? "").trim(),
          String(form.get("password") ?? ""),
        );
        if (!login.ok) {
          setError(login.error ?? "Đăng nhập thất bại.");
          return;
        }
      }

      const status = await activateLicense(licenseKey);
      queryClient.setQueryData(LICENSE_QUERY_KEY, status);
      await queryClient.invalidateQueries();
      toast.success("Kích hoạt license thành công.");
      router.replace("/");
    } catch (failure) {
      if (failure instanceof NestApiError && failure.status === 401) {
        setNeedsLogin(true);
        setError(ADMIN_LOGIN_REQUIRED);
        return;
      }
      setError(activationErrorMessage(failure));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      {error ? (
        <Alert status="error" role="alert">
          <AlertContent>
            <AlertDescription>{error}</AlertDescription>
          </AlertContent>
        </Alert>
      ) : null}

      <FormTextField
        label="License key"
        name="licenseKey"
        placeholder="CRM-XXXX-XXXX-XXXX"
        autoComplete="off"
        disabled={submitting}
        autoFocus
      />

      {needsLogin ? (
        <>
          <FormTextField
            label="Email quản trị viên"
            name="email"
            type="email"
            placeholder="admin@example.com"
            autoComplete="username"
            disabled={submitting}
          />
          <FormTextField
            label="Mật khẩu"
            name="password"
            type="password"
            autoComplete="current-password"
            disabled={submitting}
          />
        </>
      ) : null}

      <Button type="submit" isDisabled={submitting} className="w-full">
        {submitting ? "Đang kích hoạt…" : "Kích hoạt"}
      </Button>
    </form>
  );
}
