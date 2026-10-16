"use client";

import { useAuth } from "@/components/common/auth/auth-provider";
import { isCrmAdmin } from "@/components/common/auth/permissions";
import { Logo } from "@/utils/icon";
import {
  LICENSE_QUERY_KEY,
  LICENSE_STATE_MESSAGES,
  getLicenseStatus,
} from "@/services/api/license";
import { useQuery } from "@tanstack/react-query";
import { ActivateForm } from "./activate-form";
import { LicenseStateAlert } from "./license-state-alert";
import { NotAdminNotice } from "./not-admin-notice";
import { SignOutButton } from "./sign-out-button";

/** Shown to signed-in users while crm-backend has no active license. */
export function ActivateCard() {
  const { user } = useAuth();
  // Same query as LicenseGate, so this reads the cached status.
  const { data: status } = useQuery({
    queryKey: LICENSE_QUERY_KEY,
    queryFn: getLicenseStatus,
  });
  const stateMessage = status ? LICENSE_STATE_MESSAGES[status.status] : null;
  const canActivate = isCrmAdmin(user);

  return (
    <section className="w-full max-w-md rounded-2xl border border-card-border bg-card-background p-8 shadow-xs sm:p-10">
      <div className="mb-4 flex justify-center">
        <Logo className="size-11" aria-hidden="true" />
      </div>
      <h1 className="text-center text-xl font-semibold text-text-primary">
        {canActivate ? "Kích hoạt CRM" : "CRM chưa được kích hoạt"}
      </h1>

      {stateMessage ? <LicenseStateAlert message={stateMessage} /> : null}

      {canActivate ? <ActivateForm /> : <NotAdminNotice />}

      {status?.installationId ? (
        <p className="mt-6 text-center text-xs text-text-tertiary">
          Mã cài đặt: {status.installationId}
        </p>
      ) : null}

      <SignOutButton />
    </section>
  );
}
