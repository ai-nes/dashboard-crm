"use client";

import { AssignmentProvider } from "./assignment-context";
import AssignmentDetail from "./assignment-detail";
import AssignmentHeader from "./assignment-header";
import AssignmentHistory from "./assignment-history";
import ReviewQueue from "./review-queue";
import StepDetail from "./step-detail";
import WorkflowSection from "./workflow-section";

export default function AssignmentWorkspace() {
  return (
    <AssignmentProvider>
      <main className="mx-auto min-w-0 max-w-[1600px] space-y-6 px-2 py-5 pb-10 lg:px-6">
        <AssignmentHeader />
        <ReviewQueue />
        <WorkflowSection />
        <AssignmentHistory />
      </main>
      <AssignmentDetail />
      <StepDetail />
    </AssignmentProvider>
  );
}
