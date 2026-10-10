"use client";

import { useAuth } from "@/components/common/auth/auth-provider";
import { canReadCrmPath } from "@/components/common/auth/permissions";

import { useQuery } from "@tanstack/react-query";

import {
  DirectorSchoolFieldActivityApiError,
  getDirectorSchoolFieldActivity,
} from "@/services/api/director-school-field-activity";

import SchoolFieldActivityApiFallback from "./school-field-activity-api-fallback";
import SchoolFieldActivityDashboard from "./school-field-activity-dashboard";

export default function SchoolFieldActivityPageClient() {
  const { user, isLoading: authLoading } = useAuth();
  const canRead = canReadCrmPath("/director/school-field-activity", user);
  const { data, error, isPending } = useQuery({
    queryKey: [
      "director-school-field-activity",
      user?.crm_user_id ?? user?.user,
    ],
    queryFn: () =>
      getDirectorSchoolFieldActivity({
        admissionYear: 2026,
        period: "season",
        scope: "all",
        activityLimit: 5,
        upcomingLimit: 5,
        includeDevices: true,
      }),
    enabled: !authLoading && canRead,
    retry: false,
  });

  if (!authLoading && !canRead) return null;

  if (authLoading || isPending) {
    return (
      <div className="h-[640px] animate-pulse rounded-2xl bg-card-background/60" />
    );
  }

  if (!data) {
    return (
      <SchoolFieldActivityApiFallback
        error={
          error
            ? fieldActivityErrorMessage(error)
            : "Không thể tải dữ liệu hoạt động trường và thực địa."
        }
      />
    );
  }

  return <SchoolFieldActivityDashboard data={data} />;
}

function fieldActivityErrorMessage(error: unknown): string {
  if (
    error instanceof DirectorSchoolFieldActivityApiError &&
    error.status === 401
  ) {
    return "Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại.";
  }
  if (
    error instanceof DirectorSchoolFieldActivityApiError &&
    error.status === 403
  ) {
    return "Bạn không có quyền xem dữ liệu hoạt động trường và thực địa.";
  }
  if (
    error instanceof DirectorSchoolFieldActivityApiError &&
    error.status >= 500
  ) {
    return "Nguồn dữ liệu hoạt động trường và thực địa hiện chưa sẵn sàng.";
  }
  return error instanceof Error
    ? error.message
    : "Không thể tải dữ liệu hoạt động trường và thực địa.";
}
