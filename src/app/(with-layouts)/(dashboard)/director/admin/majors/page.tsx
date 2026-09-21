import type { Metadata } from "next";

import { MajorManagementPage } from "@/components/segments/major-management-page";

export const metadata: Metadata = {
  title: "Danh mục tuyển sinh",
  description: "Quản lý ngành học, địa bàn, năm tuyển sinh và kênh chiến dịch trong CRM.",
};

export default function MajorManagementRoute() {
  return <MajorManagementPage />;
}
