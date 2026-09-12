"use client";

import { useState } from "react";
import { FieldError, Form, Label } from "react-aria-components";
import { DropdownField } from "@/components/common/dropdown-field";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { TextField } from "@/components/tailgrids/core/text-field";
import { useAssignment } from "./assignment-context";
import type { AssignmentRecord } from "./types";

export default function AssignmentForm({
  record,
}: {
  record: AssignmentRecord;
}) {
  const { detail, resolve, isResolving } = useAssignment();
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [region, setRegion] = useState(record.region);
  const candidates = detail?.candidates ?? [];
  const canResolve = detail?.permissions.canResolve ?? false;

  return (
    <Form
      className="mt-5 space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        if (
          !ownerId ||
          !region.trim() ||
          reason.trim().length < 10 ||
          !canResolve
        )
          return;
        await resolve(record.id, ownerId, reason.trim(), region.trim());
      }}
    >
      {!record.region && (
        <TextField
          required
          value={region}
          onChange={setRegion}
          validate={(value) =>
            value.trim() ? null : "Nhập khu vực của học sinh."
          }
          className="gap-1.5"
        >
          <Label className="text-sm font-medium text-text-primary">
            Khu vực <span className="text-badge-error-text">*</span>
          </Label>
          <Input placeholder="Ví dụ: Cần Thơ" className="text-sm" />
          <FieldError className="text-xs text-badge-error-text" />
        </TextField>
      )}
      <div className="flex w-full flex-col gap-1.5">
        <Label className="text-sm font-medium text-text-primary">
          Người phụ trách
        </Label>
        <DropdownField
          ariaLabel="Người phụ trách"
          contentClassName="z-[110]"
          isDisabled={!canResolve || !candidates.length}
          isRequired
          onChange={setOwnerId}
          options={candidates.map((person) => ({
            id: person.id,
            label: person.displayName,
            description: `Đang phụ trách ${person.activeStudents} học sinh · còn ${person.remainingCapacity} chỗ`,
          }))}
          placeholder={
            candidates.length
              ? "Chọn người phụ trách"
              : "Không có ứng viên khả dụng"
          }
          renderOption={(option) => (
            <div className="min-w-0 py-1">
              <span className="block truncate text-text-primary">
                {option.label}
              </span>
              <span className="block truncate text-xs text-text-tertiary">
                {option.description}
              </span>
            </div>
          )}
          triggerClassName="h-11 text-text-primary"
          value={ownerId}
        />
      </div>
      <TextField
        required
        value={reason}
        onChange={setReason}
        validate={(value) =>
          value.trim().length >= 10 ? null : "Lý do cần tối thiểu 10 ký tự."
        }
        className="gap-1.5"
      >
        <Label className="text-sm font-medium text-text-primary">
          Lý do phân công <span className="text-badge-error-text">*</span>
        </Label>
        <TextArea
          rows={3}
          placeholder="Ví dụ: Đã thống nhất hỗ trợ thêm khu vực này."
          className="px-3 py-2.5 text-sm"
        />
        <FieldError className="text-xs text-badge-error-text" />
      </TextField>
      <p className="text-xs leading-5 text-text-tertiary">
        Lý do được lưu cùng audit event. Hồ sơ đã có người phụ trách không thể
        ghi đè bằng thao tác này.
      </p>
      {!canResolve && (
        <p className="text-xs text-badge-error-text">
          Bạn không có quyền xử lý hồ sơ này.
        </p>
      )}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        isDisabled={
          !canResolve ||
          isResolving ||
          !ownerId ||
          !region.trim() ||
          reason.trim().length < 10
        }
      >
        {isResolving ? "Đang lưu…" : "Xác nhận phân công"}
      </Button>
    </Form>
  );
}
