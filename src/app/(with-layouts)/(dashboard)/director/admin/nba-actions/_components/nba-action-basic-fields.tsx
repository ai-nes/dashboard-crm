"use client";

import { Input } from "@/components/tailgrids/core/input";
import { TextArea } from "@/components/tailgrids/core/text-area";
import type {
  ActionChannel,
  ActionExecutionType,
} from "@/services/api/nba-actions";

import NbaActionFormSelect from "./nba-action-form-select";
import type {
  ActionFormFieldSetter,
  ActionFormState,
} from "./nba-action-form-types";

const CHANNEL_OPTIONS: Array<{ id: ActionChannel; label: string }> = [
  { id: "NONE", label: "Không có kênh" },
  { id: "CALL", label: "Cuộc gọi" },
  { id: "EMAIL", label: "Email" },
  { id: "MESSAGE", label: "Tin nhắn" },
];

const EXECUTION_OPTIONS: Array<{ id: ActionExecutionType; label: string }> = [
  { id: "MANUAL", label: "Thực hiện thủ công" },
  { id: "AI_ASSISTED", label: "Có AI hỗ trợ" },
];

interface NbaActionBasicFieldsProps {
  form: ActionFormState;
  isNew: boolean;
  canEdit: boolean;
  actionTypeOptions: { id: string; label: string }[];
  setField: ActionFormFieldSetter;
}

export default function NbaActionBasicFields({
  form,
  isNew,
  canEdit,
  actionTypeOptions,
  setField,
}: NbaActionBasicFieldsProps) {
  return (
    <section
      className="min-w-0 space-y-4"
      aria-labelledby="action-basic-heading"
    >
      <div>
        <h2
          id="action-basic-heading"
          className="text-base font-semibold text-text-primary"
        >
          Thông tin hành động
        </h2>
        <p className="mt-0.5 text-xs leading-4 text-text-secondary">
          Mã hành động không thể thay đổi sau khi tạo.
        </p>
      </div>
      <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
        <label className="flex min-w-0 flex-col gap-1.5">
          <span className="text-xs font-medium text-input-label-text">
            Mã hành động
          </span>
          <Input
            value={form.code}
            onChange={(event) =>
              setField("code", event.target.value.toUpperCase())
            }
            readOnly={!isNew}
            disabled={!canEdit}
            placeholder="Ví dụ: SEND_EMAIL"
            className="h-11 w-full rounded-xl px-3 text-base md:h-10 md:text-sm"
          />
        </label>
        <label className="flex min-w-0 flex-col gap-1.5">
          <span className="text-xs font-medium text-input-label-text">
            Tên hiển thị
          </span>
          <Input
            value={form.displayName}
            onChange={(event) => setField("displayName", event.target.value)}
            disabled={!canEdit}
            placeholder="Ví dụ: Gửi Email tư vấn"
            className="h-11 w-full rounded-xl px-3 text-base md:h-10 md:text-sm"
          />
        </label>
        <NbaActionFormSelect
          label="Nhóm hành động"
          value={form.actionType}
          options={actionTypeOptions}
          onChange={(value) => setField("actionType", value)}
          disabled={!canEdit || actionTypeOptions.length === 0}
        />
        <NbaActionFormSelect
          label="Kênh mặc định"
          value={form.defaultChannel}
          options={CHANNEL_OPTIONS}
          onChange={(value) =>
            setField("defaultChannel", value as ActionChannel)
          }
          disabled={!canEdit}
        />
        <NbaActionFormSelect
          label="Cách thực hiện"
          value={form.executionType}
          options={EXECUTION_OPTIONS}
          onChange={(value) =>
            setField("executionType", value as ActionExecutionType)
          }
          disabled={!canEdit}
        />
        <label className="flex min-w-0 flex-col gap-1.5">
          <span className="text-xs font-medium text-input-label-text">
            Thứ tự hiển thị
          </span>
          <Input
            type="number"
            min="0"
            value={form.sortOrder}
            onChange={(event) => setField("sortOrder", event.target.value)}
            disabled={!canEdit}
            className="h-11 w-full rounded-xl px-3 text-base md:h-10 md:text-sm"
          />
        </label>
        <label className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs font-medium text-input-label-text">
            Mô tả
          </span>
          <TextArea
            value={form.description}
            onChange={(event) => setField("description", event.target.value)}
            disabled={!canEdit}
            rows={2}
            placeholder="Hành động này làm gì trong quy trình tuyển sinh?"
            className="min-h-20 resize-y rounded-xl px-3 py-2 text-base leading-6 md:text-sm"
          />
        </label>
        <label className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs font-medium text-input-label-text">
            Mục đích
          </span>
          <TextArea
            value={form.purpose}
            onChange={(event) => setField("purpose", event.target.value)}
            disabled={!canEdit}
            rows={2}
            placeholder="Kết quả mong muốn khi thực hiện hành động"
            className="min-h-20 resize-y rounded-xl px-3 py-2 text-base leading-6 md:text-sm"
          />
        </label>
      </div>
    </section>
  );
}
