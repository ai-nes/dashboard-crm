import type { Metadata } from "next";

import BigTeamDetailDashboard from "../_components/big-team-detail-dashboard";
import { decodeTeamRouteParam } from "../_components/team-management-utils";

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
  const decodedBigTeamId = decodeTeamRouteParam(bigTeamId);
  return (
    <BigTeamDetailDashboard
      key={decodedBigTeamId}
      bigTeamId={decodedBigTeamId}
    />
  );
}
