"use client";

import AssignmentBatchHistory from "../../student-assignment/_components/assignment-batch-history";
import AssignmentHistoryHeader from "./assignment-history-header";

export default function AssignmentHistoryWorkspace() {
  return (
    <main className="mx-auto min-w-0 max-w-[1600px] space-y-6 px-2 py-5 pb-10 lg:px-6">
      <AssignmentHistoryHeader />
      <AssignmentBatchHistory />
    </main>
  );
}
