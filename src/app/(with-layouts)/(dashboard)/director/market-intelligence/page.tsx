import type { Metadata } from "next";
import MarketIntelligenceDashboard from "./_components/market-intelligence-dashboard";
import { getSchoolDirectory } from "@/services/api/schools/school-directory";

export const metadata: Metadata = {
  title: "Bản đồ & phân tích trường THPT",
  description:
    "Bản đồ nhiệt Potential Score và phân tích chi tiết các trường THPT trong từng khu vực tuyển sinh.",
};

export default async function MarketIntelligencePage() {
  const schools = await getSchoolDirectory();

  return (
    <MarketIntelligenceDashboard
      schoolDirectory={schools.map(({ district, id, name, provinceCode }) => ({
        district,
        id,
        name,
        provinceCode,
      }))}
    />
  );
}
