import { SegmentDetailPage } from "@/components/segments/segment-detail-page";

export const metadata = { title: "Chi tiết segment" };

export default async function Page({
  params,
}: {
  params: Promise<{ segmentId: string }>;
}) {
  const { segmentId } = await params;

  return (
    <SegmentDetailPage
      key={segmentId}
      segmentId={segmentId}
      backHref="/lead-sale/segments"
      editHref="/lead-sale/segments/edit"
    />
  );
}
