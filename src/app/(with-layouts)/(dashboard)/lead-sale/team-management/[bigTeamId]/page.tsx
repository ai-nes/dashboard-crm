import type { Metadata } from "next";

import BigTeamDetailDashboard from "../_components/big-team-detail-dashboard";

export const metadata: Metadata = {
  title: "Chi tiết team lớn",
  description: "Danh sách team nhỏ và trưởng nhóm bên trong một team lớn.",
};

export default async function BigTeamDetailPage({
  params,
}: {
  params: Promise<{ bigTeamId: string }>;
}) {
  const { bigTeamId } = await params;
  return <BigTeamDetailDashboard key={bigTeamId} bigTeamId={bigTeamId} />;
}
