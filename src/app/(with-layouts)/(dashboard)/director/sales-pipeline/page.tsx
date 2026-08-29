import type { Metadata } from "next";

import SalesPipelineWorkspace from "./_components/sales-pipeline-workspace";

export const metadata: Metadata = {
  title: "Quản lý cơ hội bán hàng",
  description: "Theo dõi pipeline tuyển sinh và điều phối các tác vụ ưu tiên trong ngày.",
};

export default function SalesPipelinePage() {
  return <SalesPipelineWorkspace />;
}
