"use client";

import {
  Alert,
  AlertContent,
  AlertDescription,
} from "@/components/tailgrids/core/alert";
import { Button } from "@/components/tailgrids/core/button";
import {
  LICENSE_QUERY_KEY,
  activateLicense,
  activationErrorMessage,
} from "@/services/api/license";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { FormTextField } from "./form-text-field";

/** Sends the key to crm-backend, which checks it with the License Hub. */
export function ActivateForm() {
  const queryClient = useQueryClient();
  const router = useRouter();
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
      const status = await activateLicense(licenseKey);
      queryClient.setQueryData(LICENSE_QUERY_KEY, status);
      await queryClient.invalidateQueries();
      toast.success("Kích hoạt license thành công.");
      router.replace("/");
    } catch (failure) {
      setError(activationErrorMessage(failure));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <p className="text-center text-sm leading-6 text-text-secondary">
        Nhập license key do nhà cung cấp gửi để mở khóa hệ thống.
      </p>

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

      <Button type="submit" isDisabled={submitting} className="w-full">
        {submitting ? "Đang kích hoạt…" : "Kích hoạt"}
      </Button>
    </form>
  );
}
