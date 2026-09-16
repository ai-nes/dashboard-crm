import type { Metadata } from "next";

import { MajorManagementPage } from "@/components/segments/major-management-page";

export const metadata: Metadata = {
  title: "Quản lý danh mục tuyển sinh",
  description: "Quản lý ngành học, địa bàn và danh bạ trường trong CRM.",
};

export default function MajorManagementRoute() {
  return <MajorManagementPage />;
}
