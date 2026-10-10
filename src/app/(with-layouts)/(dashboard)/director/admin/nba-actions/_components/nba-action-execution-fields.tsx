"use client";

import { Checkbox } from "@/components/tailgrids/core/checkbox";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
} from "@/components/tailgrids/core/select";
import type { ActionTimeSlot } from "@/services/api/nba-actions";

import NbaTimeWindowEditor from "./nba-time-window-editor";
import type {
  ActionFormFieldSetter,
  ActionFormState,
} from "./nba-action-form-types";

/** Keep in sync with the backend Action API's allowed actor vocabulary. */
const ACTION_ROLES = [
  "CTV Sale",
  "Sale",
  "Lead Sale",
  "Marketing",
  "Promoter",
  "Admissions Director",
  "System Manager",
] as const;

interface NbaActionExecutionFieldsProps {
  form: ActionFormState;
  canEdit: boolean;
  editorDisabled: boolean;
  availableTimeSlots: ActionTimeSlot[];
  setField: ActionFormFieldSetter;
}

export default function NbaActionExecutionFields({
  form,
  canEdit,
  editorDisabled,
  availableTimeSlots,
  setField,
}: NbaActionExecutionFieldsProps) {
  return (
    <div className="min-w-0 space-y-6 border-t border-card-border pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
      <section className="space-y-4" aria-labelledby="action-time-heading">
        <div>
          <h2
            id="action-time-heading"
            className="text-base font-semibold text-text-primary"
          >
            Khung giờ được phép
          </h2>
          <p className="mt-0.5 text-xs leading-4 text-text-secondary">
            Chọn thời điểm hành động có thể được gợi ý.
          </p>
        </div>
        <NbaTimeWindowEditor
          availableTimeSlots={availableTimeSlots}
          allowedTimeSlots={form.allowedTimeSlots}
          disabled={editorDisabled}
          onUnlimitedChange={(isUnlimited) =>
            setField(
              "allowedTimeSlots",
              isUnlimited ? [] : availableTimeSlots.slice(),
            )
          }
          onSlotsChange={(slots) => setField("allowedTimeSlots", slots)}
        />
      </section>

      <section
        className="space-y-4 border-t border-card-border pt-6"
        aria-labelledby="action-actors-heading"
      >
        <div>
          <h2
            id="action-actors-heading"
            className="text-base font-semibold text-text-primary"
          >
            Vai trò được phép
          </h2>
          <p className="mt-0.5 text-xs leading-4 text-text-secondary">
            Chọn các vai trò có thể thực hiện hành động này.
          </p>
        </div>
        <Select
          selectionMode="multiple"
          value={form.allowedActors}
          onChange={(value) =>
            setField(
              "allowedActors",
              Array.isArray(value)
                ? value.filter(
                    (item): item is string => typeof item === "string",
                  )
                : [],
            )
          }
          isDisabled={!canEdit}
          aria-label="Vai trò được phép thực hiện hành động"
        >
          <SelectTrigger
            size="sm"
            aria-label="Vai trò được phép thực hiện hành động"
            className="h-auto min-h-11 w-full flex-wrap justify-between gap-2 rounded-xl px-3 py-2 md:min-h-10"
          >
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
              {form.allowedActors.length === 0 ? (
                <span className="text-sm text-text-tertiary">Chọn vai trò</span>
              ) : (
                form.allowedActors.map((actor) => (
                  <span
                    key={actor}
                    className="rounded-md bg-background-gray-secondary px-2 py-1 text-xs font-medium text-text-secondary"
                  >
                    {actor}
                  </span>
                ))
              )}
            </div>
            <SelectIndicator />
          </SelectTrigger>
          <SelectContent className="min-w-(--trigger-width)">
            {ACTION_ROLES.map((actor) => (
              <SelectItem key={actor} id={actor} textValue={actor}>
                {actor}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section
        className="space-y-4 border-t border-card-border pt-6"
        aria-labelledby="action-policy-heading"
      >
        <div>
          <h2
            id="action-policy-heading"
            className="text-base font-semibold text-text-primary"
          >
            Quyền thực thi
          </h2>
          <p className="mt-0.5 text-xs leading-4 text-text-secondary">
            Thiết lập cách hành động được sử dụng.
          </p>
        </div>
        <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
          <Checkbox
            size="md"
            isSelected={form.enabled}
            onChange={(selected) => setField("enabled", selected)}
            isDisabled={!canEdit}
            className="min-h-9 w-full gap-3 py-1 text-sm text-text-secondary [&>div]:shrink-0"
          >
            Đang sử dụng
          </Checkbox>
          <Checkbox
            size="md"
            isSelected={form.aiAllowed}
            onChange={(selected) => setField("aiAllowed", selected)}
            isDisabled={!canEdit}
            className="min-h-9 w-full gap-3 py-1 text-sm text-text-secondary [&>div]:shrink-0"
          >
            AI được phép đề xuất
          </Checkbox>
          <Checkbox
            size="md"
            isSelected={form.requiresApproval}
            onChange={(selected) => setField("requiresApproval", selected)}
            isDisabled={!canEdit || form.autoExecute}
            className="min-h-9 w-full gap-3 py-1 text-sm text-text-secondary [&>div]:shrink-0"
          >
            Yêu cầu phê duyệt
          </Checkbox>
          <Checkbox
            size="md"
            isSelected={form.autoExecute}
            onChange={(selected) => setField("autoExecute", selected)}
            isDisabled={!canEdit || !form.enabled}
            className="min-h-9 w-full gap-3 py-1 text-sm text-text-secondary [&>div]:shrink-0"
          >
            Tự động thực hiện
          </Checkbox>
        </div>
        {form.autoExecute && (
          <p className="text-xs text-text-tertiary">
            Hành động tự động thực hiện bắt buộc phải đang bật.
          </p>
        )}
      </section>
    </div>
  );
}
