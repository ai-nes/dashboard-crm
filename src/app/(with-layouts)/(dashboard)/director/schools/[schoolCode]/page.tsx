"use client";

import { useAuth } from "@/components/common/auth/auth-provider";
import { canReadCrmPath } from "@/components/common/auth/permissions";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  DirectorApiError,
  getDirectorSchoolDetail,
} from "@/services/api/schools/school-intelligence";

import { toSchoolIntelligenceData } from "../_components/school-intelligence-adapter";
import SchoolIntelligenceApiFallback from "../_components/school-intelligence-api-fallback";
import SchoolDetailSkeleton from "../_components/school-detail-skeleton";
import SchoolDetailPageClient from "./school-detail-page-client";

interface SchoolDetailPageProps {
  params: Promise<{ schoolCode: string }>;
}

export default function SchoolDetailPage({ params }: SchoolDetailPageProps) {
  const { user, isLoading: authLoading } = useAuth();
  const canRead = canReadCrmPath("/director/schools", user);
  const { schoolCode } = use(params);
  const {
    data: detail,
    error,
    isPending,
  } = useQuery({
    queryKey: [
      "director-school-detail",
      schoolCode,
      user?.crm_user_id ?? user?.user,
    ],
    queryFn: () => getDirectorSchoolDetail(schoolCode),
    enabled: !authLoading && canRead,
    retry: false,
  });

  if (!authLoading && !canRead) return null;

  if (authLoading || isPending) {
    return <SchoolDetailSkeleton />;
  }

  if (!detail) {
    return (
      <SchoolIntelligenceApiFallback
        error={error ? schoolErrorMessage(error) : "Không tìm thấy trường học."}
      />
    );
  }

  return <SchoolDetailPageClient data={toSchoolIntelligenceData(detail)} />;
}

function schoolErrorMessage(error: unknown): string {
  if (error instanceof DirectorApiError && error.status === 401) {
    return "Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại.";
  }
  if (error instanceof DirectorApiError && error.status === 403) {
    return "Bạn không có quyền xem dữ liệu trường này.";
  }
  if (error instanceof DirectorApiError && error.status === 404) {
    return "Không tìm thấy trường học.";
  }
  return error instanceof Error
    ? error.message
    : "Không thể tải dữ liệu trường học.";
}
