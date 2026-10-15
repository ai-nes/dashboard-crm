"use client";
import { StudentInteractionIntents } from "./student-recorded-interaction-intents";

import { InfoCircle, RefreshCircle1Clockwise } from "@tailgrids/icons";

import { Button } from "@/components/tailgrids/core/button";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import { useInteractionDetailQuery } from "@/hooks/use-interaction-intelligence-queries";

import StudentCallQualityScore from "./student-call-quality-score";
import StudentConversationSummary from "./student-conversation-summary";

interface StudentInteractionDetailProps {
  interactionId: string;
  callSummary?: string | null;
}

export default function StudentInteractionDetail({
  interactionId,
  callSummary,
}: StudentInteractionDetailProps) {
  const detailQuery = useInteractionDetailQuery(interactionId);
  if (detailQuery.isPending) return <InteractionDetailSkeleton />;

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <div className="border-t border-card-border bg-background-gray-secondary/30 p-4 sm:p-5">
        <div className="flex items-start gap-3 rounded-lg border border-error-500/30 bg-badge-error-background p-4 text-error-600">
          <InfoCircle
            size={18}
            className="mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Không thể tải tóm tắt cuộc gọi</p>
            <p className="mt-1 text-sm">
              {detailQuery.error?.message || "Hãy thử tải lại chi tiết này."}
            </p>
            <Button
              type="button"
              variant="danger"
              appearance="ghost"
              size="sm"
              className="mt-3 min-h-11 px-0"
              onPress={() => detailQuery.refetch()}
            >
              <RefreshCircle1Clockwise size={16} />
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const detail = detailQuery.data;

  return (
    <div className="border-t border-card-border pt-4">
      <StudentInteractionIntents intents={detail.intents} />
      <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(15rem,0.42fr)] xl:items-start">
        <StudentConversationSummary
          intelligence={detail.analysis?.intelligence}
          callSummary={callSummary}
        />
        <StudentCallQualityScore interactionId={interactionId} />
      </div>
    </div>
  );
}

function InteractionDetailSkeleton() {
  return (
    <div
      className="border-t border-card-border bg-background-gray-secondary/30 p-5"
      aria-busy="true"
    >
      <div className="space-y-3">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
