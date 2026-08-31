import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getDirectorSchoolDetail } from "@/services/api/schools/school-intelligence";

import { toSchoolIntelligenceData } from "../_components/school-intelligence-adapter";
import SchoolDetailPageClient from "./school-detail-page-client";

interface SchoolDetailPageProps {
  params: Promise<{ schoolCode: string }>;
}

export const metadata: Metadata = {
  title: "Chi tiết trường THPT",
  description: "Phân tích chi tiết dữ liệu tuyển sinh và quan hệ của trường THPT.",
};

export default async function SchoolDetailPage({ params }: SchoolDetailPageProps) {
  const { schoolCode } = await params;
  const detail = await getDirectorSchoolDetail(schoolCode);
  if (!detail) notFound();

  return <SchoolDetailPageClient data={toSchoolIntelligenceData(detail)} />;
}
