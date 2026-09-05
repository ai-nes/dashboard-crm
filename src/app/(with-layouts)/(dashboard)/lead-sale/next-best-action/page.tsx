import type { Metadata } from "next";

import NextBestActionWorkspace from "@/app/(with-layouts)/(dashboard)/director/ai/next-best-action/_components/next-best-action-workspace";

export const metadata: Metadata = {
  title: "Việc cần xử lý",
  description:
    "Xem xét các đề xuất Next Best Action có căn cứ cho từng học sinh.",
};

export default function LeadSaleNextBestActionPage() {
  return <NextBestActionWorkspace />;
}
