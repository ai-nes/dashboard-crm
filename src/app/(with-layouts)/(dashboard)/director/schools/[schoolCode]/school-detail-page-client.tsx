"use client";

import type { SchoolIntelligenceData } from "@/services/api/schools/types";
import SchoolIntelligenceDashboard from "../_components/school-intelligence-dashboard";

interface Props {
  data: SchoolIntelligenceData;
}

export default function SchoolDetailPageClient({ data }: Props) {
  return <SchoolIntelligenceDashboard data={data} />;
}
