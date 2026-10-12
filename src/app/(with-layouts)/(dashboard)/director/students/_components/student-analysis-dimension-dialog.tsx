"use client";

import { DialogTrigger } from "react-aria-components";
import { Button } from "@/components/tailgrids/core/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogFooter,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import type {
  AiDimension,
  StudentAiLabels,
} from "@/services/api/student-ai/types";
import {
  getDimensionLabel,
  getDimensionLevelLabel,
  getRefTypeLabel,
} from "./student-analysis-display";

interface StudentAnalysisDimensionDialogProps {
  dimension: AiDimension;
  labels?: StudentAiLabels;
  canRead: boolean;
}

export default function StudentAnalysisDimensionDialog({
  dimension,
  labels,
  canRead,
}: StudentAnalysisDimensionDialogProps) {
  if (!canRead) return null;
  const label = getDimensionLabel(dimension.code, labels);

  return (
    <DialogTrigger>
      <Button
        appearance="ghost"
        size="xs"
        className="min-h-11"
        aria-label={`Xem dẫn chứng ${label}`}
      >
        Xem dẫn chứng
      </Button>
      <Backdrop>
        <Dialog
          showCloseButton={false}
          className="max-h-[85dvh] overflow-y-auto"
        >
          <DialogTitle>Dẫn chứng: {label}</DialogTitle>
          <StudentAnalysisDimensionDialogBody
            dimension={dimension}
            labels={labels}
            canRead={canRead}
          />
          <DialogFooter>
            <DialogClose appearance="outline" size="sm" className="min-h-11">
              Đóng
            </DialogClose>
          </DialogFooter>
        </Dialog>
      </Backdrop>
    </DialogTrigger>
  );
}

export function StudentAnalysisDimensionDialogBody({
  dimension,
  labels,
  canRead,
}: StudentAnalysisDimensionDialogProps) {
  if (!canRead) return null;
  const evidence =
    dimension.evidence?.filter(
      (entry) => entry.note?.trim() || entry.ref?.type?.trim(),
    ) ?? [];
  const missing =
    dimension.missing?.map((item) => item.trim()).filter(Boolean) ?? [];

  return (
    <DialogBody className="space-y-5">
      <div className="space-y-1 text-text-secondary">
        <p className="font-medium text-text-primary">
          {getDimensionLevelLabel(dimension, labels)}
        </p>
        <p>Nguồn mức: {dimension.level_source === "crm" ? "CRM" : "AI"}</p>
        {dimension.summary?.trim() && (
          <p className="break-words leading-6">{dimension.summary.trim()}</p>
        )}
      </div>
      <section className="space-y-3" aria-label="Dẫn chứng">
        <h4 className="font-semibold text-text-primary">Dẫn chứng</h4>
        {evidence.length ? (
          <ul className="space-y-3">
            {evidence.map((entry, index) => (
              <li
                key={`${entry.ref?.type}-${entry.ref?.id}-${index}`}
                className="rounded-lg border border-border-primary p-4"
              >
                <p className="text-xs font-medium text-text-secondary">
                  {getRefTypeLabel(entry.ref?.type ?? "")}
                </p>
                <p className="mt-1 break-words text-sm leading-6 text-text-primary">
                  {entry.note?.trim() || "Chưa có mô tả dẫn chứng."}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-secondary">
            Chưa có dẫn chứng cho chiều này.
          </p>
        )}
      </section>
      <section className="space-y-2" aria-label="Thông tin còn thiếu">
        <h4 className="font-semibold text-text-primary">Thông tin còn thiếu</h4>
        {missing.length ? (
          <ul className="list-disc space-y-2 pl-5 text-text-secondary">
            {missing.map((item, index) => (
              <li key={`${item}-${index}`} className="break-words leading-6">
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-secondary">
            Chưa ghi nhận thông tin cần bổ sung.
          </p>
        )}
      </section>
    </DialogBody>
  );
}
