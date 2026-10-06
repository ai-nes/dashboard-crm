"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog as AriaDialog,
  Modal as AriaModal,
} from "react-aria-components";

import { Button } from "@/components/tailgrids/core/button";
import {
  DialogBody,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import {
  createLeadCall,
  type CreateLeadCallPayload,
} from "@/services/api/lead-sale/call-logs";
import { Close } from "@tailgrids/icons";

interface LeadCreateCallDialogProps {
  isOpen: boolean;
  leadId: string;
  leadName: string;
  onOpenChange: (open: boolean) => void;
  onCreated: () => Promise<void> | void;
}

const fieldClassName =
  "w-full rounded-lg border border-card-border bg-background-white-primary px-3 py-2 text-sm text-text-primary outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20";

export default function LeadCreateCallDialog({
  isOpen,
  leadId,
  leadName,
  onOpenChange,
  onCreated,
}: LeadCreateCallDialogProps) {
  const [direction, setDirection] =
    useState<CreateLeadCallPayload["direction"]>("outbound");
  const [outcome, setOutcome] =
    useState<CreateLeadCallPayload["outcome"]>("connected");
  const [duration, setDuration] = useState("");
  const [topic, setTopic] = useState("");
  const [summary, setSummary] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setDirection("outbound");
    setOutcome("connected");
    setDuration("");
    setTopic("");
    setSummary("");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) reset();
    onOpenChange(open);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    const durationSeconds = duration.trim() ? Number(duration) : undefined;
    if (
      durationSeconds !== undefined &&
      (!Number.isInteger(durationSeconds) ||
        durationSeconds < 0 ||
        durationSeconds > 86400)
    ) {
      toast.error("Thời lượng phải là số giây nguyên từ 0 đến 86400.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createLeadCall(leadId, {
        direction,
        outcome,
        ...(durationSeconds === undefined ? {} : { durationSeconds }),
        ...(topic.trim() ? { topic: topic.trim() } : {}),
        ...(summary.trim() ? { summary: summary.trim() } : {}),
      });
      await onCreated();
      toast.success("Đã ghi nhật ký cuộc gọi.");
      handleOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể ghi nhật ký cuộc gọi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Backdrop isOpen={isOpen} onOpenChange={handleOpenChange}>
      <AriaModal className="fixed top-1/2 left-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 max-sm:max-w-[calc(100%-2rem)]">
        <AriaDialog
          aria-label={`Ghi nhật ký cuộc gọi cho ${leadName}`}
          className="relative flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-xl border border-border-primary bg-background-white-primary shadow-lg outline-none"
        >
          <DialogClose
            iconOnly
            size="sm"
            variant="ghost"
            aria-label="Đóng"
            className="absolute top-4 right-4 z-10 text-text-100 opacity-70 hover:bg-transparent hover:opacity-100 focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <Close />
          </DialogClose>
          <DialogHeader className="border-b border-card-border px-6 py-5 pr-14">
            <DialogTitle className="text-xl leading-7">
              Ghi cuộc gọi cho {leadName}
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="max-h-[calc(100vh-11rem)] space-y-4 overflow-y-auto px-6 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-text-primary">
                <span className="mb-1.5 block text-xs font-semibold">
                  Hướng cuộc gọi
                </span>
                <select
                  className={fieldClassName}
                  value={direction}
                  onChange={(event) =>
                    setDirection(
                      event.target.value as CreateLeadCallPayload["direction"],
                    )
                  }
                >
                  <option value="outbound">Cuộc gọi đi</option>
                  <option value="inbound">Cuộc gọi đến</option>
                  <option value="missed">Cuộc gọi nhỡ</option>
                </select>
              </label>
              <label className="block text-sm text-text-primary">
                <span className="mb-1.5 block text-xs font-semibold">
                  Kết quả
                </span>
                <select
                  className={fieldClassName}
                  value={outcome}
                  onChange={(event) =>
                    setOutcome(
                      event.target.value as CreateLeadCallPayload["outcome"],
                    )
                  }
                >
                  <option value="connected">Đã kết nối</option>
                  <option value="missed">Cuộc gọi nhỡ</option>
                  <option value="no-answer">Không nghe máy</option>
                  <option value="callback">Hẹn gọi lại</option>
                </select>
              </label>
            </div>
            <label className="block text-sm text-text-primary">
              <span className="mb-1.5 block text-xs font-semibold">
                Thời lượng (giây)
              </span>
              <input
                type="number"
                min={0}
                max={86400}
                step={1}
                className={fieldClassName}
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                placeholder="Ví dụ: 92"
              />
            </label>
            <label className="block text-sm text-text-primary">
              <span className="mb-1.5 block text-xs font-semibold">Chủ đề</span>
              <input
                type="text"
                maxLength={255}
                className={fieldClassName}
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="Ví dụ: Tư vấn hồ sơ"
              />
            </label>
            <label className="block text-sm text-text-primary">
              <span className="mb-1.5 block text-xs font-semibold">
                Tóm tắt
              </span>
              <textarea
                rows={4}
                maxLength={20000}
                className={fieldClassName}
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                placeholder="Ghi lại nội dung và bước tiếp theo..."
              />
            </label>
          </DialogBody>
          <DialogFooter className="border-t border-card-border px-6 py-4">
            <Button
              appearance="outline"
              onPress={() => handleOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              onPress={() => void handleSubmit()}
              isDisabled={isSubmitting}
            >
              {isSubmitting ? "Đang lưu..." : "Ghi cuộc gọi"}
            </Button>
          </DialogFooter>
        </AriaDialog>
      </AriaModal>
    </Backdrop>
  );
}
