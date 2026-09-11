import type { Metadata } from "next";

import SegmentEditPage from "@/components/segments/segment-edit-page";

export const metadata: Metadata = {
  title: "Chỉnh sửa segment",
  description: "Chỉnh sửa bộ lọc và thông tin segment tuyển sinh.",
};

export const dynamic = "force-dynamic";

export default async function LeadSaleSegmentEditPage({
  params,
}: {
  params: Promise<{ segmentCode: string }>;
}) {
  const { segmentCode } = await params;

  return (
    <SegmentEditPage
      segmentCode={segmentCode}
      backHref="/lead-sale/segments"
    />
  );
}
