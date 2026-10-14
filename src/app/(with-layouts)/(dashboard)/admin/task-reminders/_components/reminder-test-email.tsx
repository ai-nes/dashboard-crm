"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/tailgrids/core/button";
import { NestApiError } from "@/services/api/nest/nest-client";
import { sendTaskReminderTestEmail } from "@/services/api/task-reminder-settings";
import { reminderError, validateEmail } from "./form-model";
import ReminderField from "./reminder-field";
import ReminderAlert, { type ReminderFailure } from "./reminder-alert";

interface Props {
  configured: boolean;
  senderDirty: boolean;
  saving: boolean;
  onBusyChange: (busy: boolean) => void;
  onBeforeSend: () => Promise<boolean>;
}

export default function ReminderTestEmail({
  configured,
  senderDirty,
  saving,
  onBusyChange,
  onBeforeSend,
}: Props) {
  const [to, setTo] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [failure, setFailure] = useState<ReminderFailure>();
  const [sentTo, setSentTo] = useState<string>();
  const blocked = !configured && !senderDirty;

  async function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || saving || blocked) return;
    const validation = validateEmail(to);
    setError(validation);
    setFailure(undefined);
    setSentTo(undefined);
    if (validation) return;
    setPending(true);
    onBusyChange(true);
    try {
      if (!(await onBeforeSend())) return;
      const result = await sendTaskReminderTestEmail(to);
      if (!result.sent) throw new Error("Email not sent");
      setSentTo(result.to);
      toast.success(`Đã gửi email kiểm tra tới ${result.to}`);
    } catch (error) {
      const result = reminderError(error);
      setError(result.fields.to);
      setFailure({
        ...result,
        loginRequired: error instanceof NestApiError && error.status === 401,
      });
      toast.error(result.message);
    } finally {
      setPending(false);
      onBusyChange(false);
    }
  }

  return (
    <section
      aria-labelledby="reminder-test-title"
      className="min-w-0 border-t border-card-border pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6"
    >
      <h2
        id="reminder-test-title"
        className="text-sm font-medium text-text-primary"
      >
        Email kiểm tra
      </h2>
      <p className="mt-1 text-xs leading-5 text-text-tertiary">
        Kiểm tra kết nối Gmail với cấu hình đã lưu. Email thử không chứa danh
        sách task của Sales.
      </p>
      <form
        className="mt-3 space-y-3"
        onSubmit={send}
        noValidate
        aria-busy={pending}
      >
        <ReminderField
          label="Email nhận thử"
          type="email"
          required
          maxLength={254}
          value={to}
          onChange={(event) => {
            setTo(event.target.value);
            setError(undefined);
            setSentTo(undefined);
            setFailure(undefined);
          }}
          disabled={pending || saving}
          error={error}
          autoComplete="email"
          placeholder="email@example.com"
        />
        {blocked || senderDirty ? (
          <p className="text-xs leading-5 text-text-secondary">
            {senderDirty
              ? "Thay đổi Gmail, tên gửi hoặc mật khẩu sẽ được lưu trước khi gửi thử."
              : "Lưu Gmail và mật khẩu ứng dụng trước khi gửi thử."}
          </p>
        ) : null}
        {failure ? <ReminderAlert failure={failure} /> : null}
        {sentTo ? (
          <p
            role="status"
            className="break-words text-sm text-badge-success-text"
          >
            Đã gửi email kiểm tra tới {sentTo}.
          </p>
        ) : null}
        <Button
          type="submit"
          appearance="outline"
          isDisabled={pending || saving || blocked}
          className="w-full"
        >
          {pending ? "Đang gửi…" : "Gửi email thử"}
        </Button>
      </form>
    </section>
  );
}
