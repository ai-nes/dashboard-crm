"use client";

import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import type { NbaRecommendation } from "@/services/api/nba";

import { formatNbaDateTime } from "./student-nba-ui";

interface StudentNbaRecommendationDetailDialogProps {
  recommendation: NbaRecommendation;
  onClose: () => void;
}

export default function StudentNbaRecommendationDetailDialog({
  recommendation,
  onClose,
}: StudentNbaRecommendationDetailDialogProps) {
  const objective =
    (recommendation.objective ?? recommendation.reason) ||
    "Chưa có mục tiêu cho đề xuất này.";

  return (
    <Backdrop isOpen onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog
        aria-label={`Chi tiết đề xuất ${recommendation.rank}`}
        className="flex max-h-[min(44rem,calc(100vh-4rem))] max-w-2xl flex-col overflow-hidden p-0 max-sm:max-h-[calc(100vh-2rem)] max-sm:max-w-[calc(100%-2rem)]"
      >
        <DialogHeader className="shrink-0 border-b border-card-border px-5 py-5 pr-14">
          <p className="text-xs font-semibold text-primary-600 dark:text-primary-300">
            Chi tiết đề xuất
          </p>
          <DialogTitle className="mt-1 text-xl leading-7">
            {recommendation.action.title}
          </DialogTitle>
          <p className="mt-1 text-sm text-text-secondary">
            {recommendation.target.id}
          </p>
        </DialogHeader>

        <DialogBody className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-5">
            <div className="rounded-lg bg-background-soft-50 p-4">
              <p className="text-xs font-semibold text-text-tertiary">
                Mục tiêu
              </p>
              <p className="mt-1.5 text-sm leading-6 text-text-primary">
                {objective}
              </p>
              {recommendation.objective && recommendation.reason && (
                <p className="mt-2 text-xs leading-5 text-text-secondary">
                  Tín hiệu: {recommendation.reason}
                </p>
              )}
            </div>

            {recommendation.context.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-text-tertiary">
                  Căn cứ
                </p>
                <ul className="mt-2 space-y-2 text-sm leading-5 text-text-secondary">
                  {recommendation.context.slice(0, 3).map((fact) => (
                    <li key={fact} className="flex gap-2">
                      <span
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-primary-500"
                        aria-hidden="true"
                      />
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {recommendation.ruleDecision ? (
              <div className="rounded-lg border border-card-border bg-background-gray-secondary/60 p-4">
                <p className="text-xs font-semibold text-text-tertiary">Căn cứ Rule Engine</p>
                <p className="mt-1.5 text-sm leading-6 text-text-primary">
                  {recommendation.ruleDecision.businessReason ?? "Đã nhận quyết định từ Rule Engine."}
                </p>
                {recommendation.ruleDecision.salesNextStep ? (
                  <p className="mt-2 text-sm leading-6 text-text-primary">
                    <span className="font-semibold">Bước tiếp theo: </span>
                    {recommendation.ruleDecision.salesNextStep}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-text-tertiary">
                  <span>Outcome: {recommendation.ruleDecision.outcome}</span>
                  {recommendation.ruleDecision.ruleVersion ? <span>Version: {recommendation.ruleDecision.ruleVersion}</span> : null}
                </div>
                {recommendation.ruleDecision.matchedRuleIds.length > 0 ? (
                  <p className="mt-2 text-xs text-text-secondary">
                    Rule khớp: {recommendation.ruleDecision.matchedRuleIds.slice(0, 5).join(", ")}
                  </p>
                ) : null}
                {recommendation.ruleDecision.reasonCodes.length > 0 ? (
                  <p className="mt-1 text-xs text-text-secondary">
                    Mã lý do: {recommendation.ruleDecision.reasonCodes.slice(0, 5).join(", ")}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="grid gap-4 border-t border-card-border pt-4 sm:grid-cols-2">
              <TimingField
                label="Thực hiện từ"
                value={formatNbaDateTime(recommendation.timing.scheduledAt)}
              />
              <TimingField
                label="Hạn xử lý"
                value={formatNbaDateTime(recommendation.timing.expiresAt)}
              />
            </div>
          </div>
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

function TimingField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-text-tertiary">{label}</p>
      <p className="mt-1 text-sm text-text-primary">{value}</p>
    </div>
  );
}
