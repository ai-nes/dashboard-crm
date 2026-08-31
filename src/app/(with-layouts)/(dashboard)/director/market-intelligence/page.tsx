import type { Metadata } from "next";
import MarketIntelligencePageClient from "./market-intelligence-page-client";

export const metadata: Metadata = {
  title: "Bản đồ & phân tích trường THPT",
  description:
    "Bản đồ nhiệt theo độ phủ trường trọng điểm và phân tích chi tiết các trường THPT trong từng khu vực tuyển sinh.",
};

export default function MarketIntelligencePage() {
  return <MarketIntelligencePageClient />;
}
