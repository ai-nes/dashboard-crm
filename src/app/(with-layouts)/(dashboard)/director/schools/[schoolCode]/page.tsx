import type { Metadata } from "next";
import { notFound } from "next/navigation";

import SchoolIntelligenceDashboard from "../_components/school-intelligence-dashboard";
import { buildSchoolIntelligence } from "../_components/mock-data";
import { getSchoolById } from "@/services/api/schools/school-directory";

interface SchoolDetailPageProps {
  params: Promise<{ schoolCode: string }>;
}

export async function generateMetadata({ params }: SchoolDetailPageProps): Promise<Metadata> {
  const { schoolCode } = await params;
  const school = await getSchoolById(schoolCode);
  return { title: school ? `${school.name} | School Intelligence` : "Không tìm thấy trường | School Intelligence" };
}

export default async function SchoolDetailPage({ params }: SchoolDetailPageProps) {
  const { schoolCode } = await params;
  const school = await getSchoolById(schoolCode);
  if (!school) notFound();

  return <SchoolIntelligenceDashboard data={buildSchoolIntelligence(school)} />;
}
