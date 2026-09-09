import { redirect } from "next/navigation";

export const metadata = { title: "Chi tiết segment" };

export default async function Page({
  params,
}: {
  params: Promise<{ segmentId: string }>;
}) {
  const { segmentId } = await params;
  redirect(`/lead-sale/segments/${encodeURIComponent(segmentId)}`);
}
