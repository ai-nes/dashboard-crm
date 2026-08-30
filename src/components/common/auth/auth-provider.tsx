"use client";

import { getCurrentUser, type CurrentUser } from "@/services/api/auth";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useMemo, type ReactNode } from "react";

interface AuthContextValue {
  /** Current Frappe user, or null when not authenticated. */
  user: CurrentUser | null;
  /** True while the initial session check is in flight. */
  isLoading: boolean;
  /** Re-run the session check (after login or logout). */
  refetch: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AUTH_QUERY_KEY = ["auth", "me"] as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isPending, refetch } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      user: data ?? null,
      isLoading: isPending,
      refetch: () => void refetch(),
    }),
    [data, isPending, refetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>.");
  return ctx;
}
