"use client";

import { use } from "react";
import { useEffect, useState } from "react";

import {
  DirectorApiError,
  getDirectorSchoolDetail,
} from "@/services/api/schools/school-intelligence";
import type { DirectorSchoolDetailData } from "@/services/api/schools/types";

import { toSchoolIntelligenceData } from "../_components/school-intelligence-adapter";
import SchoolIntelligenceApiFallback from "../_components/school-intelligence-api-fallback";
import SchoolDetailPageClient from "./school-detail-page-client";

interface SchoolDetailPageProps {
  params: Promise<{ schoolCode: string }>;
}

export default function SchoolDetailPage({ params }: SchoolDetailPageProps) {
  const { schoolCode } = use(params);
  const [detail, setDetail] = useState<DirectorSchoolDetailData | null>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;

    setDetail(undefined);
    setError(undefined);
    getDirectorSchoolDetail(schoolCode)
      .then((data) => {
        if (cancelled) return;
        setDetail(data);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(schoolErrorMessage(requestError));
      });

    return () => {
      cancelled = true;
    };
  }, [schoolCode]);

  if (detail === undefined && !error) {
    return <div className="h-[640px] animate-pulse rounded-2xl bg-card-background/60" />;
  }

  if (!detail) {
    return <SchoolIntelligenceApiFallback error={error ?? "Không tìm thấy trường học."} />;
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
  return error instanceof Error ? error.message : "Không thể tải dữ liệu trường học.";
}
