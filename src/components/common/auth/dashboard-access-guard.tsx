"use client";

import { useAuth } from "@/components/common/auth/auth-provider";
import {
  canAccessDashboardPath,
  getDefaultRouteForRoles,
  getRecognizedRoles,
  isProtectedDashboardPath,
} from "@/components/common/auth/rbac";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

export function DashboardAccessGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const recognizedRoles = useMemo(
    () => getRecognizedRoles(user?.roles),
    [user?.roles],
  );
  const isProtectedPath = isProtectedDashboardPath(pathname);
  const hasAccess = canAccessDashboardPath(pathname, user?.roles);
  const fallbackRoute = getDefaultRouteForRoles(user?.roles);

  useEffect(() => {
    if (
      !user ||
      !isProtectedPath ||
      hasAccess ||
      recognizedRoles.length === 0
    ) {
      return;
    }

    router.replace(fallbackRoute);
  }, [
    fallbackRoute,
    hasAccess,
    isProtectedPath,
    recognizedRoles.length,
    router,
    user,
  ]);

  if (!isProtectedPath || hasAccess) return <>{children}</>;

  if (recognizedRoles.length === 0) {
    return (
      <main className="flex min-h-full items-center justify-center px-6 py-16">
        <div className="max-w-md rounded-xl border border-card-border bg-card-background p-6 text-center">
          <h1 className="text-lg font-semibold text-text-primary">
            Chưa được cấp quyền CRM
          </h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Tài khoản chưa có một role CRM hợp lệ. Vui lòng liên hệ quản trị hệ
            thống để được cấp quyền.
          </p>
          <Link
            href="/profile"
            className="mt-5 inline-flex rounded-lg border border-card-border px-3.5 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-background-gray-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            Xem tài khoản
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-full items-center justify-center px-6 py-16">
      <span className="text-sm text-text-secondary">
        Đang chuyển đến không gian làm việc của bạn…
      </span>
    </div>
  );
}
