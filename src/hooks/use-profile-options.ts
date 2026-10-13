"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/common/auth/auth-provider";
import { getCrmDoctypePermissions } from "@/components/common/auth/permissions";
import {
  getActiveProfileOptions,
  type ProfileOptionType,
} from "@/services/api/profile-options";

export const PROFILE_OPTIONS_QUERY_KEY = ["profile-options"] as const;

export function useProfileOptions(type: ProfileOptionType, enabled = true) {
  const { user } = useAuth();
  const canRead = getCrmDoctypePermissions(user, "CRM Profile Option").canRead;
  const query = useQuery({
    queryKey: [...PROFILE_OPTIONS_QUERY_KEY, user?.user, "active", type],
    queryFn: ({ signal }) => getActiveProfileOptions(type, signal),
    enabled: canRead && enabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  return { ...query, canRead };
}
