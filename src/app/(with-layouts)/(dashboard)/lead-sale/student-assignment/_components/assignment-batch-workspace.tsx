"use client";

import { FileText } from "@tailgrids/icons";
import { Card } from "@/components/tailgrids/core/card";
import {
  BatchAssignmentProvider,
  useBatchAssignment,
} from "../../_shared/lead-assignment-batch/batch-assignment-context";
import AssignmentBatchExecution from "./assignment-batch-execution";
import AssignmentBatchHeader from "./assignment-batch-header";
import AssignmentBatchHistory from "./assignment-batch-history";
import AssignmentBatchWorkflow from "./assignment-batch-workflow";

export default function AssignmentBatchWorkspace() {
  return (
    <BatchAssignmentProvider>
      <AssignmentBatchWorkspaceContent />
    </BatchAssignmentProvider>
  );
}

function AssignmentBatchWorkspaceContent() {
  const { activeBatch, error } = useBatchAssignment();

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
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-live="polite">
          {activeBatch ? (
            <AssignmentBatchExecution />
          ) : (
            <Card className="flex min-h-72 flex-col items-center justify-center text-center">
              <span className="flex size-12 items-center justify-center rounded-xl bg-badge-sky-background text-badge-sky-text">
                <FileText size={22} aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-base font-semibold text-text-primary">
                Chưa có đợt để phân công
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">
                Chọn một đợt đã được tạo từ luồng tiếp nhận Lead để xem sơ đồ
                quy trình và kết quả phân công.
              </p>
            </Card>
          )}
        </section>
        <aside>
          <AssignmentBatchHistory compact />
        </aside>
      </div>
    </main>
  );
}
