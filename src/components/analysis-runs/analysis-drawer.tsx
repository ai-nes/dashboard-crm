"use client";

import { ChevronDown, Close, Sparkle } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/tailgrids/core/collapsible";
import {
  SheetContent,
  SheetOverlay,
  SheetTitle,
} from "@/components/tailgrids/core/sheet";
import type {
  AnalysisRunKind,
  AnalysisRunSnapshot,
} from "@/services/api/analysis-runs";

import AnalysisClaimsView from "./analysis-claims-view";
import AnalysisRichReport from "./analysis-rich-report";
import { stageLabels, statusMeta } from "./analysis-run-meta";
import AnalysisStageRail from "./analysis-stage-rail";

interface AnalysisDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  run: AnalysisRunSnapshot;
  title: string;
  kind: AnalysisRunKind;
  targetId: string;
}

export default function AnalysisDrawer({
  isOpen,
  onOpenChange,
  run,
  title,
  kind,
}: AnalysisDrawerProps) {
  const reportStages = run.stages.filter((stage) => stage.report);
  const hasClaims = run.stages.some((stage) => stage.claims.length > 0);
  return (
    <SheetOverlay isOpen={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full max-w-full overflow-y-auto border-l border-card-border bg-card-background p-0 sm:max-w-2xl lg:max-w-3xl"
      >
        <div className="sticky top-0 z-20 flex items-start justify-between gap-4 border-b border-card-border bg-card-background px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400"
              aria-hidden="true"
            >
              <Sparkle size={18} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <SheetTitle className="text-base font-bold text-text-primary">
                  {title}
                </SheetTitle>
                <Badge color={statusMeta[run.status].color} size="sm">
                  {statusMeta[run.status].label}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-text-tertiary">
                Đề xuất, tín hiệu và nguồn đối soát.
              </p>
            </div>
          </div>

          <Button
            size="xs"
            appearance="ghost"
            onPress={() => onOpenChange(false)}
            aria-label="Đóng bảng chi tiết"
            className="size-8 p-0 text-text-secondary hover:text-text-primary"
          >
            <Close size={18} />
          </Button>
        </div>

        <div className="space-y-4 px-5 py-5 sm:px-6">
          <AnalysisStageRail stages={run.stages} />
          {reportStages.map((stage) => (
            <AnalysisRichReport
              key={`${stage.id ?? stage.stageKind}-report`}
              report={stage.report!}
              stageLabel={stageLabels[stage.stageKind]}
            />
          ))}
          {(!reportStages.length || hasClaims) && (
            <AnalysisClaimsView stages={run.stages} />
          )}

          <Collapsible className="max-w-none rounded-xl border-card-border bg-background-soft-50 data-expanded:pb-0">
            <CollapsibleTrigger className="p-4 text-sm font-semibold text-text-primary sm:p-4">
              <span>Thông tin kỹ thuật</span>
              <ChevronDown
                size={16}
                className="shrink-0 transition-transform duration-200 group-data-expanded:rotate-180"
                aria-hidden="true"
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4 text-xs text-text-secondary">
              <div className="grid gap-2 border-t border-card-border pt-3 sm:grid-cols-2">
                <div>
                  <span className="text-text-tertiary">Run ID:</span>{" "}
                  <span className="font-mono font-medium text-text-primary">
                    {run.runId}
                  </span>
                </div>
                {run.receiptId && (
                  <div>
                    <span className="text-text-tertiary">Receipt ID:</span>{" "}
                    <span className="font-mono font-medium text-text-primary">
                      {run.receiptId}
                    </span>
                  </div>
                )}
                {run.sourceRevision !== null &&
                  run.sourceRevision !== undefined && (
                    <div>
                      <span className="text-text-tertiary">Bản sửa đổi:</span>{" "}
                      <span className="font-semibold text-text-primary">
                        v{run.sourceRevision}
                      </span>
                    </div>
                  )}
                {run.expiresAt && (
                  <div>
                    <span className="text-text-tertiary">Hết hạn:</span>{" "}
                    <span className="font-medium text-text-primary">
                      {run.expiresAt}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-text-tertiary">Đối tượng:</span>{" "}
                  <span className="font-medium text-text-primary">
                    {kind === "student" ? "Hồ sơ học sinh" : "Trường THPT"}
                  </span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </SheetContent>
    </SheetOverlay>
  );
}
