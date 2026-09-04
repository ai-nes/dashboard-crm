"use client";

import { useAuth } from "./auth-provider";
import { getDefaultRouteForRoles } from "./rbac";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Routes the authenticated root entry to the user's role workspace. */
export default function RoleEntryRedirect() {
  const { user } = useAuth();
  const router = useRouter();
  const destination = getDefaultRouteForRoles(user?.roles);

  useEffect(() => {
    if (user) router.replace(destination);
  }, [destination, router, user]);

  return (
    <main
      className="flex min-h-full items-center justify-center px-6 py-16"
      aria-live="polite"
    >
      <span className="text-sm text-text-secondary">
        Đang mở không gian làm việc…
      </span>
    </main>
  );
}
