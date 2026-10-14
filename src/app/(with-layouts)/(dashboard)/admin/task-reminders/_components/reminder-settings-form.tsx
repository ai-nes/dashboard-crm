"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { NestApiError } from "@/services/api/nest/nest-client";
import type {
  TaskReminderForm,
  TaskReminderSettings,
} from "@/services/api/task-reminder-settings";
import {
  formFromSettings,
  reminderError,
  validateReminderForm,
  type ReminderFieldErrors,
} from "./form-model";
import ReminderAlert, { type ReminderFailure } from "./reminder-alert";
import ReminderSenderFields from "./reminder-sender-fields";
import ReminderScheduleFields from "./reminder-schedule-fields";
import ReminderStatus from "./reminder-status";
import ReminderTestEmail from "./reminder-test-email";

interface Props {
  settings: TaskReminderSettings;
  refreshing: boolean;
  onSave: (form: TaskReminderForm) => Promise<TaskReminderSettings>;
  onStateChange: (state: { dirty: boolean; busy: boolean }) => void;
}

export default function ReminderSettingsForm({
  settings,
  refreshing,
  onSave,
  onStateChange,
}: Props) {
  const [form, setForm] = useState(() => formFromSettings(settings));
  const [errors, setErrors] = useState<ReminderFieldErrors>({});
  const [failure, setFailure] = useState<ReminderFailure>();
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const initial = formFromSettings(settings);
  const dirty = (Object.keys(initial) as (keyof TaskReminderForm)[]).some(
    (field) => form[field] !== initial[field],
  );
  const senderDirty =
    form.senderEmail.trim() !== settings.senderEmail ||
    form.senderName.trim() !== settings.senderName ||
    Boolean(form.appPassword.trim());
  const busy = saving || testing || refreshing;

  useEffect(() => {
    onStateChange({ dirty, busy: saving || testing });
  }, [dirty, saving, testing, onStateChange]);

  function change<K extends keyof TaskReminderForm>(
    field: K,
    value: TaskReminderForm[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFailure(undefined);
  }

  const saveSettings = useCallback(async () => {
    if (!dirty) return true;
    const validation = validateReminderForm(form, settings);
    setErrors(validation);
    if (Object.keys(validation).length) return false;
    setFailure(undefined);
    setSaving(true);
    try {
      const saved = await onSave(form);
      setForm(formFromSettings(saved));
      return true;
    } catch (error) {
      const result = reminderError(error);
      setErrors(result.fields);
      setFailure({
        ...result,
        loginRequired: error instanceof NestApiError && error.status === 401,
      });
      toast.error(result.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [dirty, form, settings, onSave]);

  useEffect(() => {
    if (!dirty || busy || failure || editingPassword) return;
    const timer = window.setTimeout(() => void saveSettings(), 800);
    return () => window.clearTimeout(timer);
  }, [dirty, busy, failure, editingPassword, saveSettings]);

  const sectionProps = {
    form,
    settings,
    errors,
    disabled: busy,
    onChange: change,
  };

  return (
    <div className="mt-3 min-h-0 flex-1 overflow-y-auto pb-8">
      <form
        onSubmit={(event) => event.preventDefault()}
        onFocusCapture={(event) => {
          if (
            event.target instanceof HTMLInputElement &&
            event.target.name === "appPassword"
          )
            setEditingPassword(true);
        }}
        onBlurCapture={(event) => {
          if (
            event.target instanceof HTMLInputElement &&
            event.target.name === "appPassword"
          )
            setEditingPassword(false);
        }}
        noValidate
        aria-busy={saving}
        className="space-y-4"
      >
        <div className="grid items-stretch gap-5 lg:grid-cols-2">
          <ReminderSenderFields {...sectionProps} />
          <ReminderScheduleFields {...sectionProps} />
        </div>
        {failure ? <ReminderAlert failure={failure} /> : null}
        <p className="text-xs text-text-tertiary" role="status">
          {saving
            ? "Đang tự động lưu…"
            : failure
              ? "Chưa lưu được. Chỉnh lại thông tin để thử lại."
              : dirty
                ? "Tự động lưu khi thông tin hợp lệ"
                : "Đã lưu · Thay đổi được lưu tự động"}
        </p>
      </form>
      <Card className="mt-5 p-5">
        <CardHeader className="mb-5">
          <CardTitle>Trạng thái và kiểm tra gửi</CardTitle>
          <span className="text-xs text-text-tertiary">
            Mỗi Sales nhận một email riêng
          </span>
        </CardHeader>
        <div className="grid items-start gap-5 lg:grid-cols-2">
          <ReminderStatus settings={settings} />
          <ReminderTestEmail
            configured={
              settings.passwordConfigured && Boolean(settings.senderEmail)
            }
            senderDirty={senderDirty}
            saving={saving || refreshing}
            onBusyChange={setTesting}
            onBeforeSend={saveSettings}
          />
        </div>
      </Card>
    </div>
  );
}
