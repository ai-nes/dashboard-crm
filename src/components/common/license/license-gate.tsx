"use client";

import { useAuth } from "@/components/common/auth/auth-provider";
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

/** Sign-in screens work without a license; sessions survive a lost key. */
const AUTH_PATH_PREFIXES = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/auth/",
];

function isAuthPath(pathname: string): boolean {
  return AUTH_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function GateMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full min-h-dvh items-center justify-center">
      <span className="text-sm text-text-secondary">{children}</span>
    </div>
  );
}

/** Where the current screen must go, or null to render it. */
function redirectTarget(
  usable: boolean,
  signedIn: boolean,
  onActivatePage: boolean,
): string | null {
  if (usable) return onActivatePage ? "/" : null;
  if (!signedIn) return onActivatePage ? "/login" : null;
  return onActivatePage ? null : ACTIVATE_PATH;
}

/**
 * After sign-in, locks every CRM screen until crm-backend has an active
 * license; only the activation screen renders meanwhile. Signed-out screens
 * are left to AuthGuard. The backend guard is the real lock.
 */
export function LicenseGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const authPage = isAuthPath(pathname);
  const { data, isPending, isError, refetch, isRefetching } = useQuery({
    queryKey: LICENSE_QUERY_KEY,
    queryFn: getLicenseStatus,
    refetchInterval: RECHECK_MS,
    retry: 1,
    enabled: !authPage,
  });
  const ready = !authPage && !authLoading && Boolean(data);
  const target = ready
    ? redirectTarget(
        isLicenseUsable(data?.status),
        Boolean(user),
        pathname === ACTIVATE_PATH,
      )
    : null;

  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);

  if (authPage) return <>{children}</>;
  if (isError && !data) {
    return (
      <LicenseUnavailable
        retrying={isRefetching}
        onRetry={() => void refetch()}
      />
    );
  }
  if (isPending || authLoading) {
    return <GateMessage>Đang kiểm tra license…</GateMessage>;
  }
  if (target) return <GateMessage>Đang chuyển trang…</GateMessage>;

  return <>{children}</>;
}
