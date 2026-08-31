import type { Metadata } from "next";

import { getSchoolById } from "@/services/api/schools/school-directory";

import { buildSchoolIntelligence } from "../_components/mock-data";
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
  const directorySchool = await getSchoolById(schoolCode);
  const initialIntelligence = directorySchool ? buildSchoolIntelligence(directorySchool) : undefined;

  return <SchoolDetailPageClient initialIntelligence={initialIntelligence} schoolCode={schoolCode} />;
}
