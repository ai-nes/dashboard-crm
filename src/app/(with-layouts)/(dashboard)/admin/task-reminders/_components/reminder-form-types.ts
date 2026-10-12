import type {
  TaskReminderForm,
  TaskReminderSettings,
} from "@/services/api/task-reminder-settings";
import type { ReminderFieldErrors } from "./form-model";

export type ReminderFormUpdater = <K extends keyof TaskReminderForm>(
  field: K,
  value: TaskReminderForm[K],
) => void;

export interface ReminderSectionProps {
  form: TaskReminderForm;
  settings: TaskReminderSettings;
  errors: ReminderFieldErrors;
  disabled: boolean;
  onChange: ReminderFormUpdater;
}
