import type { Metadata } from "next";

import { MajorManagementPage } from "@/components/segments/major-management-page";

export const metadata: Metadata = {
  title: "Quản lý ngành học",
  description: "Quản lý Major Group và các ngành học con trong CRM.",
};

export default function MajorManagementRoute() {
  return <MajorManagementPage />;
}
