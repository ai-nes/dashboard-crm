"use client";

import { useEffect, useState } from "react";
import { Close } from "@tailgrids/icons";
import { Dialog as AriaDialog, Modal } from "react-aria-components";
import { Button } from "@/components/tailgrids/core/button";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/tailgrids/core/dialog";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import {
  getTaskReminderTemplate,
  updateTaskReminderTemplate,
  type TaskReminderTemplate,
  type TaskReminderSettings,
} from "@/services/api/task-reminder-settings";
import ReminderTemplateEditor from "./reminder-template-editor";
import ReminderTemplatePreview from "./reminder-template-preview";
import ReminderAlert, { type ReminderFailure } from "./reminder-alert";
import { reminderError } from "./form-model";
import { NestApiError } from "@/services/api/nest/nest-client";
import { toast } from "sonner";

export default function ReminderTemplateDialog({
  onClose,
  sender,
}: {
  onClose: () => void;
  sender: Pick<TaskReminderSettings, "senderName" | "senderEmail">;
}) {
  const [template, setTemplate] = useState<TaskReminderTemplate>();
  const [html, setHtml] = useState("");
  const [failure, setFailure] = useState<ReminderFailure>();
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    getTaskReminderTemplate()
      .then((data) => {
        if (active) {
          setTemplate(data);
          setHtml(data.html);
          setFailure(undefined);
        }
      })
      .catch((error) => {
        if (active)
          setFailure({
            ...reminderError(error),
            loginRequired:
              error instanceof NestApiError && error.status === 401,
          });
      });
    return () => {
      active = false;
    };
  }, [loadAttempt]);
  async function save() {
    if (!html.trim() || saving) return;
    setSaving(true);
    setFailure(undefined);
    try {
      const data = await updateTaskReminderTemplate(html);
      setTemplate(data);
      setHtml(data.html);
      toast.success("Đã lưu mẫu email nhắc task");
    } catch (error) {
      const result = reminderError(error);
      setFailure({
        ...result,
        message: result.fields.html ?? result.message,
        loginRequired: error instanceof NestApiError && error.status === 401,
      });
    } finally {
      setSaving(false);
    }
  }
  return (
    <Backdrop
      isOpen
      onOpenChange={(open) => {
        if (!open && !saving) onClose();
      }}
      isDismissable={!saving}
      isKeyboardDismissDisabled={saving}
    >
      <Modal className="fixed top-1/2 left-1/2 z-50 w-[96vw] max-w-[120rem] -translate-x-1/2 -translate-y-1/2">
        <AriaDialog
          aria-label="Chỉnh sửa mẫu email nhắc task"
          className="flex h-[min(84vh,56rem)] max-h-[calc(100vh-1rem)] flex-col overflow-hidden rounded-xl border border-border-primary bg-background-white-primary shadow-lg outline-none"
        >
          <DialogHeader className="flex shrink-0 flex-row items-center justify-between border-b border-card-border px-3 py-1.5">
            <DialogTitle className="text-base leading-6">
              Chỉnh sửa mẫu email nhắc task
            </DialogTitle>
            <Button
              iconOnly
              appearance="ghost"
              size="xs"
              aria-label="Đóng mẫu email"
              onPress={onClose}
              isDisabled={saving}
            >
              <Close size={16} />
            </Button>
          </DialogHeader>
          {template ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <div
                className="flex shrink-0 items-center gap-1 border-b border-card-border px-3 py-1.5"
                aria-label="Chế độ mẫu email"
              >
                <Button
                  size="sm"
                  appearance={preview ? "ghost" : "outline"}
                  aria-pressed={!preview}
                  onPress={() => setPreview(false)}
                >
                  Chỉnh HTML
                </Button>
                <Button
                  size="sm"
                  appearance={preview ? "outline" : "ghost"}
                  aria-pressed={preview}
                  onPress={() => setPreview(true)}
                >
                  Xem trước
                </Button>
                {preview ? (
                  <span className="ml-auto text-xs text-text-tertiary">
                    Dữ liệu mẫu
                  </span>
                ) : null}
              </div>
              <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto p-2 sm:p-3">
                {preview ? (
                  <ReminderTemplatePreview
                    html={html}
                    sender={sender}
                    values={template.previewValues}
                  />
                ) : (
                  <ReminderTemplateEditor
                    html={html}
                    tokens={template.tokens}
                    disabled={saving}
                    onChange={(value) => {
                      setHtml(value);
                      setFailure(undefined);
                    }}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 p-5" role="status">
              {failure ? (
                <Button
                  appearance="outline"
                  size="sm"
                  onPress={() => setLoadAttempt((value) => value + 1)}
                >
                  Tải lại mẫu email
                </Button>
              ) : (
                "Đang tải mẫu email…"
              )}
            </div>
          )}
          <div className="shrink-0 border-t border-card-border px-3 py-1.5">
            {failure ? (
              <div className="pt-3">
                <ReminderAlert failure={failure} />
              </div>
            ) : null}
            <DialogFooter className="flex-row justify-end gap-2 pt-0">
              <Button
                appearance="outline"
                size="xs"
                onPress={onClose}
                isDisabled={saving}
              >
                Đóng
              </Button>
              <Button
                size="xs"
                onPress={() => void save()}
                isDisabled={
                  !template || !html.trim() || html === template.html || saving
                }
                className="bg-primary-700 hover:bg-primary-800"
              >
                {saving ? "Đang lưu…" : "Lưu mẫu email"}
              </Button>
            </DialogFooter>
          </div>
        </AriaDialog>
      </Modal>
    </Backdrop>
  );
}
