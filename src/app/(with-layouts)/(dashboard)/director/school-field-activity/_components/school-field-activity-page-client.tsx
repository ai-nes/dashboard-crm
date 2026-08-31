"use client";

import { useEffect, useState } from "react";

import {
  DirectorSchoolFieldActivityApiError,
  getDirectorSchoolFieldActivity,
} from "@/services/api/director-school-field-activity";
import type { DirectorSchoolFieldActivityData } from "@/services/api/director-school-field-activity";

import SchoolFieldActivityApiFallback from "./school-field-activity-api-fallback";
import SchoolFieldActivityDashboard from "./school-field-activity-dashboard";

export default function SchoolFieldActivityPageClient() {
  const [data, setData] = useState<DirectorSchoolFieldActivityData>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getDirectorSchoolFieldActivity({
      admissionYear: 2026,
      period: "season",
      scope: "all",
      activityLimit: 50,
      upcomingLimit: 10,
      includeDevices: true,
    })
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setError(undefined);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(fieldActivityErrorMessage(requestError));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div className="h-[640px] animate-pulse rounded-2xl bg-card-background/60" />;
  }

  if (!data) {
    return <SchoolFieldActivityApiFallback error={error ?? "Không thể tải dữ liệu hoạt động trường và thực địa."} />;
  }

  return <SchoolFieldActivityDashboard data={data} />;
}

function fieldActivityErrorMessage(error: unknown): string {
  if (error instanceof DirectorSchoolFieldActivityApiError && error.status === 401) {
    return "Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại.";
  }
  if (error instanceof DirectorSchoolFieldActivityApiError && error.status === 403) {
    return "Bạn không có quyền xem dữ liệu hoạt động trường và thực địa.";
  }
  if (error instanceof DirectorSchoolFieldActivityApiError && error.status >= 500) {
    return "Nguồn dữ liệu hoạt động trường và thực địa hiện chưa sẵn sàng.";
  }
  return error instanceof Error ? error.message : "Không thể tải dữ liệu hoạt động trường và thực địa.";
}
