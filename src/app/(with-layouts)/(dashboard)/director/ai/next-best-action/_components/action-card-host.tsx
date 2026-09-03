"use client";

import {
  ArrowRight,
  Buildings11,
  Calendar,
  ChevronDown,
  User2,
} from "@tailgrids/icons";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";

import ActionRationale from "./cards/rationale";
import { resolveActionCard } from "./cards/registry";
import { scrubCopy } from "./cards/sanitize";
import WaitPanel from "./cards/wait-panel";
import { CONTROL_LEVEL_COLOR, CONTROL_LEVEL_LABEL } from "./control-level";
import {
  ACTION_TYPE_LABEL,
  type ActionPriority,
  type RecommendedAction,
} from "./types";

interface ActionCardHostProps {
  action: RecommendedAction | null;
  onAssign: (action: RecommendedAction) => void;
  onDefer: (action: RecommendedAction) => void;
  onDismiss: (action: RecommendedAction) => void;
}

const priorityLabels: Record<ActionPriority, string> = {
  high: "Ưu tiên cao",
  medium: "Ưu tiên vừa",
  low: "Ưu tiên thấp",
};

const priorityColors: Record<ActionPriority, "error" | "primary" | "gray"> = {
  high: "error",
  medium: "primary",
  low: "gray",
};

export default function ActionCardHost({
  action,
  onAssign,
  onDefer,
  onDismiss,
}: ActionCardHostProps) {
  const [showHow, setShowHow] = useState(true);

  if (!action) {
    return (
      <aside
        className="hidden min-h-115 items-center justify-center p-8 xl:flex"
        aria-label="Chi tiết việc cần xử lý"
      >
        <p className="max-w-60 text-center text-sm leading-6 text-text-secondary">
          Chọn một việc để xem lý do và giao người phụ trách.
        </p>
      </aside>
    );
  }

  const isWait = action.disposition === "WAIT";
  const isAssigned = action.state === "assigned";
  const Card = resolveActionCard(action.actionType);
  const typeLabel = action.actionType
    ? ACTION_TYPE_LABEL[action.actionType]
    : "Đề xuất tiếp theo";
  const showSummary =
    action.summary.trim() !== "" &&
    action.summary.trim() !== action.recommendation.trim();

  return (
    <aside
      className="min-w-0 xl:sticky xl:top-5 xl:max-h-[calc(100vh-2.5rem)] xl:overflow-y-auto"
      aria-label="Chi tiết việc cần xử lý"
    >
      <div className="border-b border-card-border p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              color={
                action.status === "overdue"
                  ? "error"
                  : action.status === "today"
                    ? "warning"
                    : "primary"
              }
            >
              {action.dueLabel}
            </Badge>
            <Badge color={priorityColors[action.priority]}>
              {priorityLabels[action.priority]}
            </Badge>
            {action.controlLevel && (
              <Badge color={CONTROL_LEVEL_COLOR[action.controlLevel]}>
                {CONTROL_LEVEL_LABEL[action.controlLevel]}
              </Badge>
            )}
          </div>
          {action.studentId && (
            <Link
              href={`/director/students/${encodeURIComponent(action.studentId)}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-300"
            >
              Mở hồ sơ 360
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          )}
        </div>
        <p className="mt-4 flex items-center gap-2 text-xs font-semibold tracking-wide text-primary-600 uppercase dark:text-primary-300">
          {typeLabel}
          <span className="text-text-tertiary normal-case">
            · {action.studentName}
          </span>
        </p>
        <h2 className="mt-1.5 text-balance text-xl leading-7 font-semibold text-text-primary">
          {action.recommendation}
        </h2>
        {showSummary && (
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {scrubCopy(action.summary)}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <Buildings11 size={15} aria-hidden="true" />
            {action.school}
          </span>
          <span>Ngành quan tâm: {action.interest}</span>
        </div>
      </div>

      <ActionRationale action={action} />

      {isWait ? (
        <div className="p-5">
          <WaitPanel
            reason={action.whyNow ?? action.summary ?? null}
            // No revisit timestamp on the director queue row yet — the WAIT
            // disposition has no producer here (it writes zero CRM Action rows).
            revisitAt={null}
          />
        </div>
      ) : (
        <>
          <section className="border-b border-card-border">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 p-5 text-left text-sm font-semibold text-text-primary outline-none focus-visible:ring-4 focus-visible:ring-button-primary-focus-ring"
              onClick={() => setShowHow((value) => !value)}
              aria-expanded={showHow}
            >
              <span>Cách xử lý</span>
              <ChevronDown
                size={18}
                className={
                  showHow
                    ? "rotate-180 transition-transform"
                    : "transition-transform"
                }
                aria-hidden="true"
              />
            </button>
            {showHow && (
              <div className="px-5 pb-5">
                <Card action={action} />
              </div>
            )}
          </section>

          <div className="p-5">
            <p className="text-xs font-medium text-text-tertiary">
              {isAssigned ? "Đang thực hiện" : "Người phụ trách đề xuất"}
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-text-primary">
              {action.suggestedAssignee}
              {isAssigned && <Badge color="success">Đã giao</Badge>}
            </p>
            {isAssigned ? (
              // Already has a sales owner — the director only needs an override
              // path, not the primary "assign" call-to-action.
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button
                  appearance="outline"
                  size="sm"
                  onPress={() => onDefer(action)}
                >
                  <Calendar size={16} />
                  Trì hoãn
                </Button>
                <Button
                  appearance="ghost"
                  size="sm"
                  onPress={() => onDismiss(action)}
                >
                  Bỏ đề xuất
                </Button>
              </div>
            ) : (
              <>
                <Button
                  className="mt-4 w-full"
                  size="md"
                  onPress={() => onAssign(action)}
                >
                  <User2 size={17} />
                  Giao việc
                </Button>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Button
                    appearance="outline"
                    size="sm"
                    onPress={() => onDefer(action)}
                  >
                    <Calendar size={16} />
                    Trì hoãn
                  </Button>
                  <Button
                    appearance="ghost"
                    size="sm"
                    onPress={() => onDismiss(action)}
                  >
                    Bỏ đề xuất
                  </Button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </aside>
  );
}
