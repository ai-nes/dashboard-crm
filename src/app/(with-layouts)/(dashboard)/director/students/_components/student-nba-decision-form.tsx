"use client";

import { RefreshCircle1Clockwise } from "@tailgrids/icons";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import { DialogFooter } from "@/components/tailgrids/core/dialog";
import { Input } from "@/components/tailgrids/core/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import type {
  NbaDecisionOperation,
  NbaRecommendation,
  NbaRecommendationPriority,
} from "@/services/api/nba";

import {
  NBA_OPERATION_LABELS,
  NBA_PRIORITY_LABELS,
  type DecisionFields,
} from "./student-nba-ui";

interface StudentNbaDecisionFormProps {
  recommendation: NbaRecommendation;
  operation: NbaDecisionOperation;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (fields: DecisionFields) => Promise<void>;
}

export default function StudentNbaDecisionForm({
  recommendation,
  operation,
  isSubmitting,
  onCancel,
  onSubmit,
}: StudentNbaDecisionFormProps) {
  const [reason, setReason] = useState("");
  const [revisitAt, setRevisitAt] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [channel, setChannel] = useState(recommendation.channel ?? "");
  const [priority, setPriority] = useState<NbaRecommendationPriority>(
    recommendation.priority,
  );
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const needsReason = operation === "REJECT" || operation === "DISMISS";
  const needsRevisit = operation === "DEFER";
  const isValid =
    (!needsReason || Boolean(reason.trim())) &&
    (!needsRevisit || Boolean(revisitAt));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitted(true);

    if (!isValid) return;

    void onSubmit({
      ...(reason.trim() ? { reason: reason.trim() } : {}),
      ...(revisitAt ? { revisitAt } : {}),
      ...(dueAt ? { dueAt } : {}),
      ...(operation === "ACCEPT_WITH_CHANGES"
        ? { priority, channel: channel.trim() }
        : {}),
    });
  };

  const submitVariant =
    operation === "ACCEPT" || operation === "ACCEPT_WITH_CHANGES"
      ? "success"
      : operation === "REJECT"
        ? "danger"
        : "primary";

  return (
    <form
      className="mt-5 space-y-4"
      aria-label={`Biểu mẫu ${NBA_OPERATION_LABELS[operation]}`}
      onSubmit={handleSubmit}
    >
      {operation === "ACCEPT_WITH_CHANGES" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-xs font-medium text-text-secondary">
            Mức ưu tiên
            <Select
              value={priority}
              isDisabled={isSubmitting}
              onChange={(key) =>
                setPriority(String(key) as NbaRecommendationPriority)
              }
              aria-label="Mức ưu tiên"
            >
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.keys(
                    NBA_PRIORITY_LABELS,
                  ) as NbaRecommendationPriority[]
                ).map((value) => (
                  <SelectItem
                    key={value}
                    id={value}
                    textValue={NBA_PRIORITY_LABELS[value]}
                  >
                    {NBA_PRIORITY_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium text-text-secondary">
            Kênh xử lý
            <Input
              value={channel}
              disabled={isSubmitting}
              onChange={(event) => setChannel(event.target.value)}
              aria-label="Kênh xử lý"
              placeholder="Ví dụ: Điện thoại"
              className="h-9 px-3 py-2 text-sm"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium text-text-secondary sm:col-span-2">
            Hạn xử lý mới (không bắt buộc)
            <Input
              type="datetime-local"
              value={dueAt}
              disabled={isSubmitting}
              onChange={(event) => setDueAt(event.target.value)}
              aria-label="Hạn xử lý mới"
              className="h-9 px-3 py-2 text-sm"
            />
          </label>
        </div>
      )}

      {needsRevisit && (
        <label className="flex flex-col gap-1.5 text-xs font-medium text-text-secondary">
          Thời điểm xem lại
          <Input
            type="datetime-local"
            value={revisitAt}
            disabled={isSubmitting}
            onChange={(event) => setRevisitAt(event.target.value)}
            aria-label="Thời điểm xem lại"
            className="h-9 px-3 py-2 text-sm"
            state={hasSubmitted && !revisitAt ? "error" : "default"}
            aria-invalid={hasSubmitted && !revisitAt}
            aria-describedby={
              hasSubmitted && !revisitAt ? "revisit-error" : undefined
            }
          />
          {hasSubmitted && !revisitAt && (
            <span
              id="revisit-error"
              className="text-xs font-normal text-input-error"
            >
              Vui lòng chọn thời điểm xem lại.
            </span>
          )}
        </label>
      )}

      {needsReason && (
        <label className="flex flex-col gap-1.5 text-xs font-medium text-text-secondary">
          Lý do quyết định
          <Input
            value={reason}
            disabled={isSubmitting}
            onChange={(event) => setReason(event.target.value)}
            aria-label="Lý do quyết định"
            placeholder="Nhập lý do để lưu vào lịch sử quyết định"
            className="h-9 px-3 py-2 text-sm"
            state={hasSubmitted && !reason.trim() ? "error" : "default"}
            aria-invalid={hasSubmitted && !reason.trim()}
            aria-describedby={
              hasSubmitted && !reason.trim() ? "reason-error" : undefined
            }
          />
          {hasSubmitted && !reason.trim() && (
            <span
              id="reason-error"
              className="text-xs font-normal text-input-error"
            >
              Vui lòng nhập lý do quyết định.
            </span>
          )}
        </label>
      )}

      <DialogFooter className="-mx-5 -mb-5 mt-6 border-t border-card-border px-5 py-4">
        <Button
          type="submit"
          size="sm"
          variant={submitVariant}
          isDisabled={isSubmitting}
        >
          {isSubmitting && (
            <RefreshCircle1Clockwise
              size={15}
              className="motion-safe:animate-spin"
              aria-hidden="true"
            />
          )}
          {isSubmitting ? "Đang ghi nhận…" : NBA_OPERATION_LABELS[operation]}
        </Button>
        <Button
          appearance="ghost"
          size="sm"
          type="button"
          onPress={onCancel}
          isDisabled={isSubmitting}
        >
          Hủy
        </Button>
      </DialogFooter>
    </form>
  );
}
