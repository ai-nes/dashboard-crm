"use client";

import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { ChevronDown } from "@tailgrids/icons";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/tailgrids/core/collapsible";
import type {
  NbaExplanation,
  NbaExplanationEvidence,
  NbaRecommendation,
} from "@/services/api/nba";

import {
  actionLabel,
  formatNbaDateTime,
  getNbaFallbackFacts,
} from "./student-nba-ui";

interface StudentNbaRecommendationDetailDialogProps {
  recommendation: NbaRecommendation;
  onClose: () => void;
}

export default function StudentNbaRecommendationDetailDialog({
  recommendation,
  onClose,
}: StudentNbaRecommendationDetailDialogProps) {
  const actionTitle = actionLabel(recommendation.actionId);

  return (
    <Backdrop isOpen onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog
        aria-label={`Chi tiết đề xuất ${recommendation.rank}`}
        className="flex max-h-[min(44rem,calc(100vh-4rem))] max-w-4xl flex-col overflow-hidden p-0 max-sm:max-h-[calc(100vh-2rem)] max-sm:max-w-[calc(100%-2rem)]"
      >
        <DialogHeader className="shrink-0 border-b border-card-border px-5 py-5 pr-14">
          <p className="text-xs font-semibold tracking-wide text-primary-600 uppercase dark:text-primary-300">
            Chi tiết đề xuất
          </p>
          <DialogTitle className="mt-1 text-xl leading-7">
            {actionTitle}
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <NbaExplanationContent
            explanation={recommendation.explanation}
            fallbackReason={recommendation.reason}
            aiPayload={recommendation.aiPayload}
          />
        </DialogBody>

        <DialogFooter className="shrink-0 border-t border-card-border px-5 py-4">
          <DialogClose appearance="outline" size="sm">
            Đóng
          </DialogClose>
        </DialogFooter>
      </Dialog>
    </Backdrop>
  );
}

function NbaExplanationContent({
  explanation,
  fallbackReason,
  aiPayload,
}: {
  explanation: NbaExplanation | null;
  fallbackReason: string;
  aiPayload: NbaRecommendation["aiPayload"];
}) {
  if (!explanation) {
    const fallbackFacts = getNbaFallbackFacts(aiPayload);

    return (
      <div className="space-y-3 rounded-lg border border-card-border bg-background-soft-50 p-4">
        <div>
          <p className="text-xs font-semibold text-text-tertiary">
            Lý do đề xuất
          </p>
          <p className="mt-2 text-sm leading-6 text-text-primary">
            {fallbackReason || "Chưa có diễn giải chi tiết cho đề xuất này."}
          </p>
        </div>
        {fallbackFacts.length > 0 && (
          <div className="grid gap-2">
            {fallbackFacts.map((fact) => (
              <div
                key={fact.label}
                className="rounded-lg border border-card-border p-3"
              >
                <p className="text-xs font-semibold text-text-tertiary">
                  {fact.label}
                </p>
                <p className="mt-1.5 text-sm leading-5 text-text-secondary">
                  {fact.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        <ExplanationBlock
          label="Lý do đề xuất"
          value={explanation.why_action}
        />
        <ExplanationBlock
          label="Tại sao cần làm ngay"
          value={explanation.why_now}
        />
        <ExplanationBlock
          label="Thời điểm phù hợp"
          value={`${formatNbaDateTime(explanation.timing.recommended_at)} — ${explanation.timing.reason}`}
        />
        <ExplanationBlock
          label="Thông tin còn thiếu"
          value={explanation.uncertainty}
        />
      </div>

      {explanation.evidence.length > 0 && (
        <EvidenceList items={explanation.evidence} />
      )}
    </div>
  );
}

function ExplanationBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-card-border p-3">
      <p className="text-xs font-semibold text-text-tertiary">{label}</p>
      <p className="mt-1.5 text-sm leading-5 text-text-secondary">{value}</p>
    </div>
  );
}

function EvidenceList({ items }: { items: NbaExplanationEvidence[] }) {
  return (
    <Collapsible
      defaultExpanded={false}
      className="max-w-none rounded-lg border-card-border bg-background-soft-50 data-expanded:pb-0"
    >
      <CollapsibleTrigger className="px-3 py-2 text-xs font-semibold text-text-primary">
        <span>Dữ kiện hỗ trợ</span>
        <ChevronDown
          size={16}
          className="transition-transform duration-200 group-data-expanded:rotate-180"
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3">
        <ul className="border-t border-card-border pt-3 text-sm leading-5 text-text-secondary">
          {items.map((item, index) => (
            <li
              key={`${item.evidence_ref}-${index}`}
              className="flex gap-2 first:pt-0 [&+li]:mt-1.5"
            >
              <span
                className="mt-2 size-1.5 shrink-0 rounded-full bg-primary-500"
                aria-hidden="true"
              />
              <span>{item.summary}</span>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}
