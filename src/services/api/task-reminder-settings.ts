import { nestRequest } from "./nest/nest-client";

export interface TaskReminderSettings {
  id: string;
  enabled: boolean;
  senderEmail: string;
  senderName: string;
  smtpHost: string;
  passwordConfigured: boolean;
  sendTime: string;
  timeZone: string;
  hoursBefore: number;
  lastRunStatus: "running" | "succeeded" | "failed" | null;
  lastRunAt: string | null;
  updatedAt: string;
}

export interface TaskReminderForm {
  enabled: boolean;
  senderEmail: string;
  senderName: string;
  appPassword: string;
  sendTime: string;
  hoursBefore: number;
}

const SETTINGS_PATH = "/api/v1/task-reminder-settings";
type Envelope<T> = { data: T; meta: { requestId: string } };

export async function getTaskReminderSettings(): Promise<TaskReminderSettings> {
  const response =
    await nestRequest<Envelope<TaskReminderSettings>>(SETTINGS_PATH);
  return response.data;
}

export async function updateTaskReminderSettings(
  form: TaskReminderForm,
): Promise<TaskReminderSettings> {
  const password = form.appPassword.trim();
  const response = await nestRequest<Envelope<TaskReminderSettings>>(
    SETTINGS_PATH,
    {
      method: "PATCH",
      body: {
        enabled: form.enabled,
        senderEmail: form.senderEmail.trim(),
        senderName: form.senderName.trim(),
        ...(password ? { appPassword: password } : {}),
        sendTime: form.sendTime,
        hoursBefore: Number(form.hoursBefore),
      },
    },
  );
  return response.data;
}

export async function sendTaskReminderTestEmail(
  to: string,
): Promise<{ sent: boolean; to: string }> {
  const response = await nestRequest<Envelope<{ sent: boolean; to: string }>>(
    `${SETTINGS_PATH}/test-email`,
    { method: "POST", body: { to: to.trim() } },
  );
  return response.data;
}

export interface TaskReminderTemplate {
  html: string;
  tokens: string[];
  previewValues: Record<string, string>;
}

export async function getTaskReminderTemplate(): Promise<TaskReminderTemplate> {
  return (
    await nestRequest<Envelope<TaskReminderTemplate>>(
      `${SETTINGS_PATH}/template`,
    )
  ).data;
}

export async function updateTaskReminderTemplate(
  html: string,
): Promise<TaskReminderTemplate> {
  return (
    await nestRequest<Envelope<TaskReminderTemplate>>(
      `${SETTINGS_PATH}/template`,
      { method: "PATCH", body: { html } },
    )
  ).data;
}
