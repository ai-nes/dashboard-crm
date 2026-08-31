import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Việc cần xử lý",
  description: "Trang SLA đã được gộp vào trung tâm việc cần xử lý.",
};

export default function SlaRiskCenterPage() {
  redirect("/director/ai/next-best-action");
}
