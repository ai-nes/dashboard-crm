"use client";

import { useState } from "react";

import { ArrowRight } from "@tailgrids/icons";

import { ConfirmDialog } from "@/components/common/delete-record-dialog";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/tailgrids/core/dropdown";
import type { StudentStatus } from "@/services/api/students/types";
import { cn } from "@/utils/cn";
import { MenuDotsIcon } from "@/utils/icon";

import {
  studentStatusBadgeColor,
  studentStatusLabel,
  studentStatusTransitions,
} from "./student-status";

const primaryTransitionLabels: Partial<Record<StudentStatus, string>> = {
  New: "Đang liên hệ",
  Attempting: "Đã kết nối",
  Connected: "Đủ điều kiện",
};

const transitionConfirmationMessages: Record<StudentStatus, string> = {
  New: "Học sinh sẽ bắt đầu bước liên hệ trong workflow.",
  Attempting: "Học sinh sẽ được chuyển sang bước Đang liên hệ.",
  Connected: "Học sinh sẽ được chuyển sang bước Đã kết nối.",
  Qualified: "Hồ sơ học sinh sẽ được xác nhận Đủ điều kiện.",
  Disqualified:
    "Hồ sơ học sinh sẽ được đánh dấu Không đủ điều kiện và dừng workflow hiện tại.",
};

const stageActionToneClassNames: Record<StudentStatus, string> = {
  New: "bg-badge-sky-background text-badge-sky-text hover:brightness-95",
  Attempting:
    "bg-badge-warning-background text-badge-warning-text hover:brightness-95",
  Connected:
    "bg-badge-primary-background text-badge-primary-text hover:bg-brand-100",
  Qualified:
    "bg-badge-success-background text-badge-success-text hover:brightness-95",
  Disqualified:
    "bg-badge-error-background text-badge-error-text hover:brightness-95",
};

const stageActionDisabledClassName =
  "disabled:bg-button-disabled-background disabled:text-button-disabled-text";

type TransitionResult = boolean | Promise<boolean>;

interface StudentStatusWorkflowProps {
  isDisabled?: boolean;
  onTransition: (nextStatus: StudentStatus) => TransitionResult;
  studentName: string;
  value: StudentStatus;
}

export default function StudentStatusWorkflow({
  isDisabled = false,
  onTransition,
  studentName,
  value,
}: StudentStatusWorkflowProps) {
  const [isDisqualifyDialogOpen, setIsDisqualifyDialogOpen] = useState(false);
  const [pendingTransition, setPendingTransition] =
    useState<StudentStatus | null>(null);
  const primaryTransition = primaryTransitionLabels[value];
  const canDisqualify =
    studentStatusTransitions[value].includes("Disqualified");

  return (
    <>
      <div
        className={
          primaryTransition
            ? "grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-3"
            : "flex min-w-0 flex-col items-start gap-1"
        }
      >
        <div className="min-w-0">
          <p className="text-[11px] text-text-tertiary">Trạng thái hiện tại</p>
          <Badge
            aria-current="step"
            color={studentStatusBadgeColor[value]}
            size="md"
            className="mt-1 border border-current px-2.5 py-1 text-sm font-semibold shadow-xs"
          >
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-current ring-2 ring-current/20"
            />
            {studentStatusLabel[value]}
          </Badge>
        </div>

        {primaryTransition && (
          <ArrowRight
            size={18}
            aria-hidden="true"
            className="mt-6 shrink-0 text-text-tertiary"
          />
        )}

        {primaryTransition && (
          <div className="min-w-0">
            <p className="text-[11px] text-text-tertiary">Chuyển sang</p>
            <div className="mt-1 flex min-w-0 items-center gap-1.5">
              <Button
                size="sm"
                variant="primary"
                appearance="outline"
                className={cn(
                  "min-w-0 cursor-pointer whitespace-nowrap border-card-border bg-background-soft-50 text-text-secondary shadow-xs hover:border-text-secondary hover:bg-background-soft-100 hover:text-text-primary",
                  stageActionDisabledClassName,
                )}
                isDisabled={isDisabled}
                onPress={() =>
                  setPendingTransition(getPrimaryTransition(value))
                }
              >
                {primaryTransition}
              </Button>

              {canDisqualify && (
                <SecondaryTransitionMenu
                  isDisabled={isDisabled}
                  onDisqualify={() => setIsDisqualifyDialogOpen(true)}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {pendingTransition && (
        <ConfirmDialog
          ariaLabel="Xác nhận chuyển trạng thái học sinh"
          confirmAppearance={getConfirmButtonAppearance(pendingTransition)}
          confirmLabel="Xác nhận"
          confirmButtonClassName={getConfirmButtonClassName(pendingTransition)}
          confirmVariant={getConfirmButtonVariant(pendingTransition)}
          isOpen={Boolean(pendingTransition)}
          isConfirming={isDisabled}
          onConfirm={async () => {
            const didTransition = await onTransition(pendingTransition);
            if (didTransition) setPendingTransition(null);
          }}
          onOpenChange={(open) => {
            if (!open && !isDisabled) setPendingTransition(null);
          }}
          title="Xác nhận chuyển trạng thái"
          description={
            <>
              Xác nhận chuyển {studentName || "học sinh này"} sang trạng thái{" "}
              <span className="font-medium text-text-secondary">
                {studentStatusLabel[pendingTransition]}
              </span>
              ?
            </>
          }
        >
          <p className="text-sm text-text-secondary">
            {transitionConfirmationMessages[pendingTransition]}
          </p>
        </ConfirmDialog>
      )}

      {canDisqualify && (
        <ConfirmDialog
          ariaLabel="Xác nhận chuyển sang không đủ điều kiện"
          confirmAppearance={getConfirmButtonAppearance("Disqualified")}
          confirmLabel="Xác nhận"
          confirmVariant={getConfirmButtonVariant("Disqualified")}
          isConfirming={isDisabled}
          isOpen={isDisqualifyDialogOpen}
          onConfirm={async () => {
            const didTransition = await onTransition("Disqualified");
            if (didTransition) setIsDisqualifyDialogOpen(false);
          }}
          onOpenChange={setIsDisqualifyDialogOpen}
          title="Xác nhận chuyển trạng thái"
          description={
            <>
              Xác nhận chuyển {studentName || "học sinh này"} sang trạng thái{" "}
              <span className="font-medium text-text-secondary">
                {studentStatusLabel.Disqualified}
              </span>
              ?
            </>
          }
        >
          <p className="text-sm text-text-secondary">
            {transitionConfirmationMessages.Disqualified}
          </p>
        </ConfirmDialog>
      )}
    </>
  );
}

interface SecondaryTransitionMenuProps {
  isDisabled: boolean;
  onDisqualify: () => void;
}

function SecondaryTransitionMenu({
  isDisabled,
  onDisqualify,
}: SecondaryTransitionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Các chuyển trạng thái khác"
        isDisabled={isDisabled}
        className="flex size-8 shrink-0 items-center justify-center rounded-md text-text-tertiary outline-none transition hover:bg-background-soft-50 hover:text-text-primary focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50"
      >
        <MenuDotsIcon aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent placement="bottom end" className="w-44 p-1">
        <DropdownMenuItem
          className="px-2.5 py-1.5 text-sm text-error-500 hover:bg-badge-error-background focus:bg-badge-error-background"
          onAction={onDisqualify}
        >
          Không đủ điều kiện
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getPrimaryTransition(currentStatus: StudentStatus): StudentStatus {
  switch (currentStatus) {
    case "New":
      return "Attempting";
    case "Attempting":
      return "Connected";
    case "Connected":
      return "Qualified";
    default:
      return currentStatus;
  }
}

function getConfirmButtonAppearance(
  nextStatus: StudentStatus,
): "fill" | "ghost" {
  return nextStatus === "Qualified" || nextStatus === "Disqualified"
    ? "fill"
    : "ghost";
}

function getConfirmButtonClassName(
  nextStatus: StudentStatus,
): string | undefined {
  return nextStatus === "Qualified" || nextStatus === "Disqualified"
    ? undefined
    : getStageActionToneClassName(nextStatus);
}

function getConfirmButtonVariant(
  nextStatus: StudentStatus,
): "primary" | "danger" | "success" {
  if (nextStatus === "Qualified") return "success";
  if (nextStatus === "Disqualified") return "danger";
  return "primary";
}

function getStageActionToneClassName(nextStatus: StudentStatus): string {
  return cn(
    stageActionToneClassNames[nextStatus],
    stageActionDisabledClassName,
  );
}
