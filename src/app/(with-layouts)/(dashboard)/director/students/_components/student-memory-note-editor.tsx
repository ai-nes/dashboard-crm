"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/tailgrids/core/button";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { useStudentMemoryActions } from "@/hooks/use-student-ai";
import type { AiMemoryItem } from "@/services/api/student-ai";
import { NestApiError } from "@/services/api/nest/nest-client";
import { Input } from "@/components/tailgrids/core/input";
import { TextField, Label } from "react-aria-components";

export default function StudentMemoryNoteEditor({
  studentId,
  item,
  canEdit,
}: {
  studentId: string;
  item: AiMemoryItem;
  canEdit: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.text);
  const [due, setDue] = useState(item.due ?? "");
  const [confirmClose, setConfirmClose] = useState<
    "done" | "contradicted" | null
  >(null);
  const [error, setError] = useState("");
  const { edit, close } = useStudentMemoryActions(studentId);
  const busy = edit.isPending || close.isPending;
  if (!canEdit || item.status !== "open") return null;
  const fail = (reason: unknown) => {
    const message =
      reason instanceof NestApiError && reason.status === 409
        ? "Ghi chú đã thay đổi. Hãy tải lại để xem nội dung mới nhất trước khi sửa."
        : "Không thể cập nhật ghi chú. Vui lòng kiểm tra quyền chỉnh sửa và thử lại.";
    setError(message);
    toast.error(message);
  };
  const finish = async () => {
    if (!canEdit || busy || !confirmClose) return;
    setError("");
    try {
      await close.mutateAsync({ item, status: confirmClose });
      toast.success(
        confirmClose === "done"
          ? "Đã hoàn tất ghi chú theo dõi."
          : "Đã loại bỏ ghi chú khỏi thông tin đang theo dõi.",
      );
      setConfirmClose(null);
    } catch (reason) {
      fail(reason);
    }
  };
  const save = async () => {
    if (!canEdit || !draft.trim() || busy) return;
    setError("");
    try {
      await edit.mutateAsync({ item, text: draft.trim(), due: due || null });
      setEditing(false);
      toast.success("Đã cập nhật ghi chú.");
    } catch (reason) {
      fail(reason);
    }
  };
  return (
    <div className="space-y-3">
      {editing ? (
        <>
          <TextArea
            aria-label="Nội dung ghi chú theo dõi"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={4000}
            rows={4}
            disabled={busy}
          />
          <TextField className="flex max-w-xs flex-col gap-2" isDisabled={busy}>
            <Label className="text-sm text-text-primary">Hạn theo dõi</Label>
            <Input
              type="date"
              value={due}
              onChange={(event) => setDue(event.target.value)}
            />
            <span className="text-xs text-text-tertiary">
              Để trống nếu không có hạn.
            </span>
          </TextField>
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              appearance="outline"
              isDisabled={busy}
              onPress={() => setEditing(false)}
            >
              Hủy
            </Button>
            <Button size="sm" isDisabled={busy || !draft.trim()} onPress={save}>
              {edit.isPending ? "Đang lưu…" : "Lưu ghi chú"}
            </Button>
          </div>
        </>
      ) : confirmClose ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <p className="mr-auto text-sm text-text-secondary">
            {confirmClose === "done"
              ? "Đánh dấu đã xử lý xong?"
              : "Loại khỏi thông tin AI đang sử dụng?"}{" "}
            Lịch sử vẫn được giữ.
          </p>
          <Button
            size="sm"
            appearance="outline"
            isDisabled={busy}
            onPress={() => {
              setConfirmClose(null);
              setError("");
            }}
          >
            Hủy
          </Button>
          <Button
            size="sm"
            variant={confirmClose === "contradicted" ? "danger" : "primary"}
            isDisabled={busy}
            onPress={finish}
          >
            {busy
              ? "Đang lưu…"
              : confirmClose === "done"
                ? "Xác nhận hoàn tất"
                : "Xác nhận loại bỏ"}
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            size="sm"
            appearance="outline"
            onPress={() => {
              setDraft(item.text);
              setDue(item.due ?? "");
              setError("");
              setEditing(true);
            }}
          >
            Chỉnh sửa ghi chú
          </Button>
          <Button
            size="sm"
            appearance="outline"
            onPress={() => {
              setError("");
              setConfirmClose("done");
            }}
          >
            Hoàn tất
          </Button>
          <Button
            size="sm"
            appearance="ghost"
            className="text-error-500"
            onPress={() => {
              setError("");
              setConfirmClose("contradicted");
            }}
          >
            Loại bỏ
          </Button>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-error-500">
          {error}
        </p>
      )}
    </div>
  );
}
