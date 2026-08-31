"use client";

import { useEffect, useState } from "react";

import { DirectorApiError, getDirectorSchoolDetail } from "@/services/api/schools/school-intelligence";
import type { DirectorSchoolDetailData, SchoolIntelligenceData } from "@/services/api/schools/types";
import SchoolIntelligenceDashboard from "../_components/school-intelligence-dashboard";
import SchoolIntelligenceApiFallback from "../_components/school-intelligence-api-fallback";
import { toSchoolIntelligenceData } from "../_components/school-intelligence-adapter";

interface Props {
  initialIntelligence?: SchoolIntelligenceData;
  schoolCode: string;
}

export default function SchoolDetailPageClient({ initialIntelligence, schoolCode }: Props) {
  const [data, setData] = useState<DirectorSchoolDetailData>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(!initialIntelligence);

  useEffect(() => {
    if (initialIntelligence) return;

    let cancelled = false;

    getDirectorSchoolDetail(schoolCode)
      .then((detail) => {
        if (cancelled) return;
        if (!detail) {
          setError("Không tìm thấy trường này.");
          return;
        }
        setData(detail);
        setError(undefined);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(schoolErrorMessage(requestError));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initialIntelligence, schoolCode]);

  if (initialIntelligence) return <SchoolIntelligenceDashboard data={initialIntelligence} />;

  if (loading) {
    return <div className="min-h-[640px] animate-pulse rounded-2xl bg-card-background/60" />;
  }

  if (data) return <SchoolIntelligenceDashboard data={toSchoolIntelligenceData(data)} />;

  return <SchoolIntelligenceApiFallback error={error} />;
}

function schoolErrorMessage(error: unknown): string {
  if (error instanceof DirectorApiError && error.status === 401) return "Phiên đăng nhập không còn hợp lệ.";
  if (error instanceof DirectorApiError && error.status === 403) return "Bạn không có quyền xem chi tiết trường này.";
  if (error instanceof DirectorApiError && error.status >= 500) return "Nguồn dữ liệu trường học hiện chưa sẵn sàng.";
  return "Không thể tải dữ liệu trường học từ CRM.";
}
