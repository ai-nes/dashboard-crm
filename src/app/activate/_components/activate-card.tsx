"use client";

import { Logo } from "@/utils/icon";
import {
  LICENSE_QUERY_KEY,
  LICENSE_STATE_MESSAGES,
  getLicenseStatus,
} from "@/services/api/license";
import { useQuery } from "@tanstack/react-query";
import { ActivateForm } from "./activate-form";
import { LicenseStateAlert } from "./license-state-alert";

/** Activation screen shown while crm-backend has no active license. */
export function ActivateCard() {
  // Same query as LicenseGate, so this reads the cached status.
  const { data: status } = useQuery({
    queryKey: LICENSE_QUERY_KEY,
    queryFn: getLicenseStatus,
  });
  const stateMessage = status ? LICENSE_STATE_MESSAGES[status.status] : null;

  return (
    <section className="w-full max-w-md rounded-2xl border border-card-border bg-card-background p-8 shadow-xs sm:p-10">
      <div className="mb-4 flex justify-center">
        <Logo className="size-11" aria-hidden="true" />
      </div>
      <h1 className="text-center text-xl font-semibold text-text-primary">
        Kích hoạt CRM
      </h1>
      <p className="mt-2 text-center text-sm leading-6 text-text-secondary">
        Nhập license key do nhà cung cấp gửi để mở khóa hệ thống.
      </p>

      {stateMessage ? <LicenseStateAlert message={stateMessage} /> : null}

      <ActivateForm />

      {status?.installationId ? (
        <p className="mt-6 text-center text-xs text-text-tertiary">
          Mã cài đặt: {status.installationId}
        </p>
      ) : null}
    </section>
  );
}
