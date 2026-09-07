"use client";

import {
  AssignmentProvider,
  useAssignment,
} from "../../_shared/student-assignment/assignment-context";
import AssignmentDetail from "../../_shared/student-assignment/assignment-detail";
import AssignmentHistory from "../../_shared/student-assignment/assignment-history";
import AssignmentHistoryHeader from "./assignment-history-header";

export default function AssignmentHistoryWorkspace() {
  return (
    <AssignmentProvider>
      <AssignmentHistoryWorkspaceContent />
    </AssignmentProvider>
  );
}

function AssignmentHistoryWorkspaceContent() {
  const { error } = useAssignment();
  return (
    <>
      <main className="mx-auto min-w-0 max-w-[1600px] space-y-6 px-2 py-5 pb-10 lg:px-6">
        {error && (
          <div role="alert" className="rounded-xl border border-badge-error-text/30 bg-badge-error-background px-4 py-3 text-sm text-badge-error-text">
            Không thể tải lịch sử phân công: {error.message}
          </div>
        )}
        <AssignmentHistoryHeader />
        <AssignmentHistory />
      </main>
      <AssignmentDetail />
    </>
  );
}
