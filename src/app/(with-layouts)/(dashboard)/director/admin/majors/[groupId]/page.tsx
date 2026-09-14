import type { Metadata } from "next";

import { MajorGroupDetailPage } from "@/components/segments/major-group-detail-page";

export const metadata: Metadata = {
  title: "Chi tiết Major Group",
  description: "Quản lý các ngành học thuộc một Major Group.",
};

export default async function MajorGroupDetailRoute({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  return <MajorGroupDetailPage groupId={decodeURIComponent(groupId)} />;
}
