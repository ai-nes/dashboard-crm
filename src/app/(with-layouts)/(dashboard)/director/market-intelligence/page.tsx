import type { Metadata } from "next";
import MarketIntelligenceDashboard from "./_components/market-intelligence-dashboard";

export const metadata: Metadata = {
  title: "Bản đồ Thị trường Tuyển sinh | AI-NES Admission Intelligence",
  description:
    "Phân tích thị trường, mật độ người học lớp 12, tỷ lệ thâm nhập FPTU và phát hiện địa bàn tiềm năng chưa khai thác.",
};

export default function MarketIntelligencePage() {
  return <MarketIntelligenceDashboard />;
}

