import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Quản trị hành động và đề xuất NBA",
  description: "Bản xem trước giao diện quản trị hành động và đề xuất cho quy trình tuyển sinh.",
};

export default function ActionRecommendationsPage() {
  redirect("/director/admin/nba-actions");
}
