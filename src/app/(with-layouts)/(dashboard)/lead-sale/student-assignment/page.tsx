import type { Metadata } from "next";

import AssignmentBatchWorkspace from "./_components/assignment-batch-workspace";

export const metadata: Metadata = {
  title: "Phân công Lead",
  description:
    "Theo dõi các bước kiểm tra và phân công Lead theo từng đợt.",
};

export default function LeadSaleStudentAssignmentPage() {
  return <AssignmentBatchWorkspace />;
}
