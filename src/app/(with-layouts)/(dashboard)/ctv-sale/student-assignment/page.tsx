import { Suspense } from "react";
import type { Metadata } from "next";

import { WorkspaceRouteSkeleton } from "@/components/common/loading/route-skeleton";
import OwnAssignmentHistory from "@/app/(with-layouts)/(dashboard)/lead-sale/_shared/lead-assignment-batch/own-assignment-history";

export const metadata: Metadata = {
  title: "Phân công Lead",
  description: "Lịch sử các Lead được phân công cho CTV Sale.",
};

export default function CtvSaleStudentAssignmentPage() {
  return (
    <Suspense fallback={<WorkspaceRouteSkeleton />}>
      <OwnAssignmentHistory />
    </Suspense>
  );
}
