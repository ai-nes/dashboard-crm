import { SegmentDetailPage } from "@/components/segments/segment-detail-page";

export const metadata = { title: "Chi tiết segment" };

export default async function CtvSaleSegmentDetailPage({
  params,
}: {
  params: Promise<{ segmentId: string }>;
}) {
  const { segmentId } = await params;

  return (
    <SegmentDetailPage
      key={segmentId}
      segmentId={segmentId}
      backHref="/ctv-sale/segments"
      editHref="/ctv-sale/segments/edit"
    />
  );
}
