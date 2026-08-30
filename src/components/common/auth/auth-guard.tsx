"use client";

import { useAuth } from "@/components/common/auth/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

/**
 * Gates the authenticated app shell. Redirects to /login once the session check
 * resolves without a user; renders a lightweight placeholder until then.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-full min-h-dvh items-center justify-center">
        <span className="text-sm text-text-secondary">Đang tải…</span>
      </div>
    );
  }

  return <>{children}</>;
}
