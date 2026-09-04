"use client";

import { useState } from "react";
import { FieldError, Form, Label } from "react-aria-components";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { TextField } from "@/components/tailgrids/core/text-field";
import { useAssignment } from "./assignment-context";
import { candidates } from "./data";
import type { AssignmentRecord } from "./types";

export default function AssignmentForm({
  record,
}: {
  record: AssignmentRecord;
}) {
  const { resolve } = useAssignment();
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [region, setRegion] = useState(record.region);

  return (
    <Form
      className="mt-5 space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!ownerId || !region.trim() || !reason.trim()) return;
        resolve(record.id, ownerId, reason.trim(), region.trim());
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
      <Select
        isRequired
        value={ownerId ?? undefined}
        onChange={(key: string | number) =>
          setOwnerId(key ? String(key) : null)
        }
        className="flex w-full flex-col gap-1.5"
        placeholder="Chọn người phụ trách"
      >
        <SelectLabel className="text-sm font-medium text-text-primary">
          Người phụ trách
        </SelectLabel>
        <SelectTrigger className="h-11 text-text-primary">
          <SelectValue />
          <SelectIndicator />
        </SelectTrigger>
        <SelectContent className="z-[110]">
          {candidates.map((person) => (
            <SelectItem key={person.id} id={person.id} textValue={person.name}>
              <div className="py-1">
                <span className="block">{person.name}</span>
                <span className="text-xs text-text-tertiary">
                  Đang phụ trách {person.workload} học sinh · Cần Thơ
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <TextField
        required
        value={reason}
        onChange={setReason}
        validate={(value) => (value.trim() ? null : "Ghi lý do phân công.")}
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
        Trưởng nhóm tự chọn người phụ trách. Lý do được lưu kèm kết quả phân
        công trong bản thử.
      </p>
      <Button
        type="submit"
        className="w-full"
        size="lg"
        isDisabled={!ownerId || !region.trim() || !reason.trim()}
      >
        Xác nhận phân công thử
      </Button>
    </Form>
  );
}
