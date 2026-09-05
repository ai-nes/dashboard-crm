"use client";

import { AssignmentProvider } from "./assignment-context";
import AssignmentDetail from "./assignment-detail";
import AssignmentHeader from "./assignment-header";
import AssignmentHistory from "./assignment-history";
import ReviewQueue from "./review-queue";
import StepDetail from "./step-detail";
import WorkflowSection from "./workflow-section";
import { useAssignment } from "./assignment-context";

export default function AssignmentWorkspace() {
  return (
    <AssignmentProvider>
      <AssignmentWorkspaceContent />
    </AssignmentProvider>
  );
}

function AssignmentWorkspaceContent() {
  const { error } = useAssignment();
  return (
    <>
      <main className="mx-auto min-w-0 max-w-[1600px] space-y-6 px-2 py-5 pb-10 lg:px-6">
        {error && (
          <div role="alert" className="rounded-xl border border-badge-error-text/30 bg-badge-error-background px-4 py-3 text-sm text-badge-error-text">
            Không thể tải workspace phân công: {error.message}
          </div>
        )}
        <AssignmentHeader />
        <ReviewQueue />
        <WorkflowSection />
        <AssignmentHistory />
      </main>
      <AssignmentDetail />
      <StepDetail />
    </>
  );
}
