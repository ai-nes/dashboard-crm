import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Quản lý segments",
  description: "Không gian quản lý segments sẽ được bổ sung sau.",
};

export default function LeadSaleNextBestActionPage() {
  redirect("/lead-sale/segments");
}
