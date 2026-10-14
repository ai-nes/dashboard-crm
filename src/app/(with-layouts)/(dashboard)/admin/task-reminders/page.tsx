import type { Metadata } from "next";
import TaskReminderSettingsPage from "./_components/task-reminder-settings-page";

export const metadata: Metadata = {
  title: "Email nhắc task",
  description: "Cấu hình Gmail và lịch email nhắc việc cho Sales.",
};

export default function Page() {
  return <TaskReminderSettingsPage />;
}
