import type { Metadata } from "next";

import SegmentBuilderPage from "@/components/segments/segment-builder-page";

export const metadata: Metadata = {
  title: "Tạo segment",
  description: "Tạo segment mới cho quy trình tuyển sinh.",
};

export default function LeadSaleSegmentCreatePage() {
  return <SegmentBuilderPage backHref="/lead-sale/next-best-action" />;
}
