"use client";

import {
  Dialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import { cn } from "@/utils/cn";
import type {
  LeadProcessingPreviewItem,
  LeadProcessingPreviewResponse,
} from "@/services/api/lead-sale";

interface LeadProcessingPreviewDialogProps {
  isOpen: boolean;
  isConfirming?: boolean;
  preview: LeadProcessingPreviewResponse | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LeadProcessingPreviewDialog({
  isOpen,
  isConfirming = false,
  preview,
  onClose,
  onConfirm,
}: LeadProcessingPreviewDialogProps) {
  if (!preview) return null;

  const { summary, items } = preview;
  return (
    <Backdrop
      isOpen={isOpen}
      isDismissable={!isConfirming}
      onOpenChange={(open) => !open && !isConfirming && onClose()}
    >
      <Dialog
        aria-label="Xem trước xử lý Lead"
        showCloseButton={!isConfirming}
        className="flex max-h-[min(48rem,calc(100vh-2rem))] max-w-[min(95vw,1500px)] flex-col overflow-hidden p-0 max-sm:max-w-[calc(100%-1rem)]"
      >
        <DialogHeader className="shrink-0 border-b border-card-border px-5 py-5 pr-14">
          <p className="text-xs font-semibold text-primary-600 dark:text-primary-300">
            Bước 3 · Xử lý Lead
          </p>
          <DialogTitle className="mt-1 text-xl leading-7">
            Xem trước hồ sơ trùng
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-text-secondary">
            Kiểm tra kết quả dự kiến trước khi hệ thống cập nhật trạng thái
            Lead. Các dòng có nhãn <strong>Trùng</strong> sẽ được đóng khi xác
            nhận.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <PreviewStat label="Tổng Lead mới" value={summary.scanned} />
              <PreviewStat label="Không trùng" value={summary.readyToAssign} />
              <PreviewStat
                label="Đã có hồ sơ học sinh"
                value={summary.matchedStudent}
              />
              <PreviewStat
                label="Trùng"
                value={summary.duplicates}
                tone="error"
              />
            </div>

            {(summary.invalid > 0 || summary.needsReview > 0) && (
              <div
                className="flex flex-wrap gap-2 text-xs"
                aria-label="Chú giải kết quả"
              >
                {summary.invalid > 0 && (
                  <Badge color="warning">Cần bổ sung: {summary.invalid}</Badge>
                )}
                {summary.needsReview > 0 && (
                  <Badge color="gray">
                    Cần kiểm tra: {summary.needsReview}
                  </Badge>
                )}
              </div>
            )}

            {items.length === 0 ? (
              <p className="py-12 text-center text-sm text-text-secondary">
                Không có Lead mới cần xử lý.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <TableRoot
                  aria-label="Kết quả xem trước xử lý Lead"
                  className="min-w-[980px]"
                >
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-14">STT</TableHead>
                      <TableHead>Họ và tên</TableHead>
                      <TableHead>Di động</TableHead>
                      <TableHead>Tỉnh/Thành phố</TableHead>
                      <TableHead>Trường THPT</TableHead>
                      <TableHead>Kết quả dự kiến</TableHead>
                      <TableHead>Thông tin đối chiếu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <ProcessingPreviewRow
                        key={`${item.lead}-${index}`}
                        index={index}
                        item={item}
                      />
                    ))}
                  </TableBody>
                </TableRoot>
              </div>
            )}
          </div>
        </DialogBody>

        <DialogFooter className="shrink-0 border-t border-card-border px-5 py-4 sm:justify-between">
          <p className="text-xs text-text-tertiary">
            Preview chỉ đọc dữ liệu; chưa thay đổi trạng thái Lead.
          </p>
          <div className="flex items-center justify-end gap-2">
            <Button
              appearance="outline"
              size="sm"
              isDisabled={isConfirming}
              onPress={onClose}
            >
              Đóng
            </Button>
            <Button
              size="sm"
              isDisabled={isConfirming || items.length === 0}
              onPress={onConfirm}
            >
              {isConfirming ? "Đang xử lý…" : "Xác nhận xử lý"}
            </Button>
          </div>
        </DialogFooter>
      </Dialog>
    </Backdrop>
  );
}

function PreviewStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "error";
}) {
  return (
    <div
      className={cn(
        "rounded-lg px-3 py-3",
        tone === "error"
          ? "bg-badge-error-background"
          : "bg-background-soft-50",
      )}
    >
      <p className="text-xs text-text-tertiary">{label}</p>
      <p className="mt-1 text-xl font-semibold text-text-primary">{value}</p>
    </div>
  );
}

function ProcessingPreviewRow({
  index,
  item,
}: {
  index: number;
  item: LeadProcessingPreviewItem;
}) {
  const isDuplicate = item.processingOutcome === "DUPLICATE";
  return (
    <TableRow className={cn(isDuplicate && "bg-badge-error-background/30")}>
      <TableCell className="text-text-tertiary">{index + 1}</TableCell>
      <TableCell>
        <p className="font-medium text-text-primary">{item.studentName}</p>
        <p className="mt-0.5 text-xs text-text-tertiary">
          {item.leadCode || item.lead}
        </p>
      </TableCell>
      <TableCell className="text-text-secondary">{item.phone || "—"}</TableCell>
      <TableCell className="text-text-secondary">
        {item.province || "—"}
      </TableCell>
      <TableCell className="text-text-secondary">
        {item.highSchool || "—"}
      </TableCell>
      <TableCell>
        <ProcessingOutcomeBadge item={item} />
      </TableCell>
      <TableCell className="max-w-72 text-xs text-text-secondary">
        {previewDetail(item)}
      </TableCell>
    </TableRow>
  );
}

function ProcessingOutcomeBadge({ item }: { item: LeadProcessingPreviewItem }) {
  switch (item.processingOutcome) {
    case "DUPLICATE":
      return <Badge color="error">Trùng</Badge>;
    case "MATCHED":
      return <Badge color="warning">Đã có hồ sơ học sinh</Badge>;
    case "CREATED":
      return <Badge color="success">Không trùng</Badge>;
    case "INVALID":
      return <Badge color="warning">Cần bổ sung</Badge>;
    default:
      return <Badge color="gray">Cần kiểm tra</Badge>;
  }
}

function previewDetail(item: LeadProcessingPreviewItem): string {
  if (item.processingOutcome === "DUPLICATE") {
    if (item.duplicateType === "MULTIPLE_STUDENTS") {
      return "Có nhiều hồ sơ học sinh trùng; cần xác định hồ sơ đúng trước khi tiếp tục.";
    }
    return item.duplicateOf
      ? `Trùng với Lead ${item.duplicateOf}.`
      : "Trùng với hồ sơ đã có.";
  }
  if (item.processingOutcome === "MATCHED") {
    return item.targetStudent
      ? `Đã khớp hồ sơ học sinh ${item.targetStudent}.`
      : "Đã khớp hồ sơ học sinh có sẵn.";
  }
  if (item.processingOutcome === "CREATED")
    return "Chưa phát hiện hồ sơ trùng.";
  return (
    humanizeProcessingReason(item.reason) || "Cần kiểm tra thêm thông tin."
  );
}

function humanizeProcessingReason(value: string | null): string {
  return (value || "")
    .replace(/<[^>]*>/g, "")
    .replace(/^(?:[A-Za-z_][A-Za-z0-9_]*\.)+[A-Za-z_][A-Za-z0-9_]*:\s*/, "")
    .replace(/^\s*[A-Z][A-Z0-9_]*:\s*/, "")
    .trim();
}
