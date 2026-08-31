"use client";

import { useAuth } from "@/components/common/auth/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Landing route after Frappe completes the Google OAuth exchange. The session
 * cookie is already set on the Frappe origin; re-check it, then route onward.
 */
export default function AuthCallbackPage() {
  const { user, isLoading, refetch } = useAuth();
  const router = useRouter();

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (isLoading) return;
    router.replace(user ? "/" : "/login");
  }, [isLoading, user, router]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background-gray-secondary_alt px-4">
      <span className="text-sm text-text-secondary">
        Đang hoàn tất đăng nhập…
      </span>
    </main>
  );
}
