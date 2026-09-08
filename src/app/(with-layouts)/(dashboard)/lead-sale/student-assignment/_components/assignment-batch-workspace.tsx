"use client";

import {
  BatchAssignmentProvider,
  useBatchAssignment,
} from "../../_shared/lead-assignment-batch/batch-assignment-context";
import AssignmentBatchHeader from "./assignment-batch-header";
import AssignmentBatchWorkflow from "./assignment-batch-workflow";

export default function AssignmentBatchWorkspace() {
  return (
    <BatchAssignmentProvider>
      <AssignmentBatchWorkspaceContent />
    </BatchAssignmentProvider>
  );
}

function AssignmentBatchWorkspaceContent() {
  const { error } = useBatchAssignment();

  return (
    <main className="mx-auto min-w-0 max-w-[1600px] space-y-6 px-2 py-5 pb-10 lg:px-6">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-badge-error-text/30 bg-badge-error-background px-4 py-3 text-sm text-badge-error-text"
        >
          Không thể tải dữ liệu đợt phân công: {error.message}
        </div>
      )}
      <AssignmentBatchHeader />
      <AssignmentBatchWorkflow />
    </main>
  );
}
