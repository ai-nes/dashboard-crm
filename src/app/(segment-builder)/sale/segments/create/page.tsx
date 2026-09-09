import type { Metadata } from "next";

import SegmentBuilderPage from "@/components/segments/segment-builder-page";
import { createDefaultSegmentName } from "@/utils/segment-name";

export const metadata: Metadata = {
  title: "Tạo segment",
  description: "Tạo segment mới cho quy trình tuyển sinh.",
};

export const dynamic = "force-dynamic";

export default function SaleSegmentCreatePage() {
  return (
    <SegmentBuilderPage
      backHref="/sale/next-best-action"
      initialSegmentName={createDefaultSegmentName()}
    />
  );
}
