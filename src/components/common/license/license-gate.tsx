"use client";

import {
  ACTIVATE_PATH,
  LICENSE_QUERY_KEY,
  getLicenseStatus,
  isLicenseUsable,
} from "@/services/api/license";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { LicenseUnavailable } from "./license-unavailable";

/** Re-check so an ended lease locks the screens without a reload. */
const RECHECK_MS = 5 * 60_000;

function GateMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full min-h-dvh items-center justify-center">
      <span className="text-sm text-text-secondary">{children}</span>
    </div>
  );
}

/**
 * Locks the whole dashboard until crm-backend has an active license; only the
 * activation screen renders meanwhile. The backend guard is the real lock.
 */
export function LicenseGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data, isPending, isError, refetch, isRefetching } = useQuery({
    queryKey: LICENSE_QUERY_KEY,
    queryFn: getLicenseStatus,
    refetchInterval: RECHECK_MS,
    retry: 1,
  });
  const usable = isLicenseUsable(data?.status);
  const onActivatePage = pathname === ACTIVATE_PATH;

  useEffect(() => {
    if (!data) return;
    if (!usable && !onActivatePage) router.replace(ACTIVATE_PATH);
    if (usable && onActivatePage) router.replace("/");
  }, [data, usable, onActivatePage, router]);

  if (isPending) return <GateMessage>Đang kiểm tra license…</GateMessage>;
  if (isError && !data) {
    return (
      <LicenseUnavailable
        retrying={isRefetching}
        onRetry={() => void refetch()}
      />
    );
  }
  if (usable === onActivatePage) {
    return <GateMessage>Đang chuyển trang…</GateMessage>;
  }

  return <>{children}</>;
}
