import { Suspense } from "react";
import type { Metadata } from "next";

import { WorkspaceRouteSkeleton } from "@/components/common/loading/route-skeleton";
import AssignmentBatchWorkspace from "./_components/assignment-batch-workspace";

export const metadata: Metadata = {
  title: "Phân công Lead",
  description:
    "Theo dõi các bước kiểm tra và phân công Lead theo từng đợt.",
};

export default async function LeadSaleStudentAssignmentPage({
  searchParams,
}: PageProps<"/lead-sale/student-assignment">) {
  const params = await searchParams;
  const activeTab = params.tab === "history" ? "history" : "assignment";

  return (
    <Suspense fallback={<WorkspaceRouteSkeleton />}>
      <AssignmentBatchWorkspace activeTab={activeTab} />
    </Suspense>
  );
}
