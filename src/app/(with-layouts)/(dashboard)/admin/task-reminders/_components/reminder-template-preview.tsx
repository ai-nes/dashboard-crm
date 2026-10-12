"use client";

import type {
  TaskReminderTemplate,
  TaskReminderSettings,
} from "@/services/api/task-reminder-settings";

import ReminderGmailFrame from "./reminder-gmail-frame";

export default function ReminderTemplatePreview({
  html,
  values,
  sender,
}: {
  html: string;
  sender: Pick<TaskReminderSettings, "senderName" | "senderEmail">;
  values: TaskReminderTemplate["previewValues"];
}) {
  const rendered = html.replace(
    /{{\s*([^{}]+)\s*}}/g,
    (_, key: string) => values[key.trim()] ?? "",
  );
  const document = `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'"><style>body{margin:0;padding:0;font-family:Arial,sans-serif;line-height:1.5;overflow-wrap:anywhere}table{max-width:100%}</style></head><body>${rendered}</body></html>`;
  return (
    <ReminderGmailFrame
      senderName={sender.senderName}
      senderEmail={sender.senderEmail}
      recipientName={values.recipientName}
    >
      <iframe
        title="Xem trước email nhắc task"
        sandbox=""
        srcDoc={document}
        className="min-h-72 w-full flex-1 border-0 bg-white lg:min-h-0"
      />
    </ReminderGmailFrame>
  );
}
