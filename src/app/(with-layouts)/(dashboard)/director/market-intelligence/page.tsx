import type { Metadata } from "next";
import { DirectorMarketApiError, getDirectorMarketIntelligence } from "@/services/api/market-intelligence";
import MarketIntelligenceDashboard from "./_components/market-intelligence-dashboard";

export const metadata: Metadata = {
  title: "Bản đồ & phân tích trường THPT",
  description:
    "Bản đồ nhiệt Potential Score và phân tích chi tiết các trường THPT trong từng khu vực tuyển sinh.",
};

export default async function MarketIntelligencePage() {
  let overview;
  try {
    overview = await getDirectorMarketIntelligence({
      period: "30d",
      region: "all",
      metric: "opportunity",
      includeSchools: true,
      schoolLimit: 6,
    });
  } catch (error) {
    return <MarketIntelligenceDashboard error={marketErrorMessage(error)} />;
  }
  return <MarketIntelligenceDashboard overview={overview} />;
}

function marketErrorMessage(error: unknown): string {
  if (error instanceof DirectorMarketApiError && error.status === 401) return "Phiên đăng nhập không còn hợp lệ.";
  if (error instanceof DirectorMarketApiError && error.status === 403) return "Bạn không có quyền xem dữ liệu thị trường.";
  if (error instanceof DirectorMarketApiError && error.status >= 500) return "Nguồn dữ liệu thị trường hiện chưa sẵn sàng.";
  return "Không thể tải dữ liệu thị trường từ CRM.";
}
