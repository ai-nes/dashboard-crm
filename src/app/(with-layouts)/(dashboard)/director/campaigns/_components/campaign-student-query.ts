import type { DirectorStudentsParams } from "@/services/api/students/types";

import type { CampaignDetailStudentStatusFilter } from "./campaign-detail-student-toolbar";

export function campaignStudentQuery(
  params: DirectorStudentsParams,
  status: CampaignDetailStudentStatusFilter,
): DirectorStudentsParams {
  const base = { ...params };
  delete base.lifecycleStatus;
  delete base.stage;

  return status === "all" ? base : { ...base, stage: status };
}
