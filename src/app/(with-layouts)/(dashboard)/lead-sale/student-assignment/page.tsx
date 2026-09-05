import type { Metadata } from "next";

import AssignmentWorkspace from "./_components/assignment-workspace";

export const metadata: Metadata = {
  title: "Phân công tự động",
  description:
    "Theo dõi phân công tự động, xem lý do và xử lý học sinh đang chờ phân công.",
};

export default function LeadSaleStudentAssignmentPage() {
  return <AssignmentWorkspace />;
}
