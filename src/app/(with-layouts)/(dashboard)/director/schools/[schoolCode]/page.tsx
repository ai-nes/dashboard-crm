import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import SchoolIntelligenceDashboard from "../_components/school-intelligence-dashboard";
import { DirectorApiError, getDirectorSchoolDetail } from "@/services/api/schools/school-intelligence";

interface SchoolDetailPageProps {
  params: Promise<{ schoolCode: string }>;
}

const loadSchoolDetail = cache((schoolCode: string) => getDirectorSchoolDetail(schoolCode));

export async function generateMetadata({ params }: SchoolDetailPageProps): Promise<Metadata> {
  const { schoolCode } = await params;
  try {
    const data = await loadSchoolDetail(schoolCode);
    return { title: data?.school.name ?? "Không tìm thấy trường" };
  } catch {
    return { title: "Chi tiết trường THPT" };
  }
}

export default async function SchoolDetailPage({ params }: SchoolDetailPageProps) {
  const { schoolCode } = await params;
  let data;
  try {
    data = await loadSchoolDetail(schoolCode);
  } catch (error) {
    return <SchoolIntelligenceDashboard error={schoolErrorMessage(error)} />;
  }
  if (!data) notFound();
  return <SchoolIntelligenceDashboard data={data} />;
}

function schoolErrorMessage(error: unknown): string {
  if (error instanceof DirectorApiError && error.status === 401) return "Phiên đăng nhập không còn hợp lệ.";
  if (error instanceof DirectorApiError && error.status === 403) return "Bạn không có quyền xem chi tiết trường này.";
  if (error instanceof DirectorApiError && error.status >= 500) return "Nguồn dữ liệu trường học hiện chưa sẵn sàng.";
  return "Không thể tải dữ liệu trường học từ CRM.";
}
