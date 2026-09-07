import type { Metadata } from "next";

import SmallTeamDetailDashboard from "../../_components/small-team-detail-dashboard";

export const metadata: Metadata = {
  title: "Chi tiết team nhỏ",
  description: "Danh sách thành viên và trưởng nhóm của một team nhỏ.",
};

export default async function SmallTeamDetailPage({
  params,
}: {
  params: Promise<{ bigTeamId: string; smallTeamId: string }>;
}) {
  const { bigTeamId, smallTeamId } = await params;
  return (
    <SmallTeamDetailDashboard key={`${bigTeamId}-${smallTeamId}`} bigTeamId={bigTeamId} smallTeamId={smallTeamId} />
  );
}
