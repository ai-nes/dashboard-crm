"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { Checkbox } from "@/components/tailgrids/core/checkbox";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/tailgrids/core/dialog";
import {
  type ProfileOption,
  type ProfileOptionInput,
  type ProfileOptionType,
  PROFILE_OPTION_LABELS,
} from "@/services/api/profile-options";

export default function ProfileOptionForm({
  type,
  initial,
  busy,
  onSave,
  onCancel,
}: {
  type: ProfileOptionType;
  initial: ProfileOption | null;
  busy: boolean;
  onSave: (input: ProfileOptionInput) => void;
  onCancel: () => void;
}) {
  const [code, setCode] = useState(initial?.code.toUpperCase() ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  function submit(event: FormEvent) {
    event.preventDefault();
    onSave({
      type,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      sortOrder: Number(sortOrder),
      isActive,
    });
  }
  return (
    <form onSubmit={submit} className="space-y-2">
      <DialogHeader>
        <DialogTitle>
          {initial ? "Sửa" : "Thêm"}{" "}
          {PROFILE_OPTION_LABELS[type].toLocaleLowerCase("vi-VN")}
        </DialogTitle>
        <DialogDescription>
          Thiết lập lựa chọn hiển thị trong hồ sơ học sinh.
        </DialogDescription>
      </DialogHeader>
      <DialogBody className="space-y-4">
        <div className="grid gap-4">
          <label className="space-y-1 text-sm text-text-secondary">
            Mã danh mục
            <Input
              aria-label="Mã danh mục"
              className="w-full"
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              required
              maxLength={64}
              disabled={busy}
            />
          </label>
          <label className="space-y-1 text-sm text-text-secondary">
            Tên hiển thị
            <Input
              aria-label="Tên hiển thị"
              className="w-full"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={type === "idIssuedPlace" ? 191 : 64}
              disabled={busy}
            />
          </label>
          <label className="space-y-1 text-sm text-text-secondary">
            Thứ tự hiển thị
            <Input
              aria-label="Thứ tự hiển thị"
              className="w-full"
              type="number"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              min={0}
              max={1000000}
              step={1}
              required
              disabled={busy}
            />
          </label>
        </div>
        <Checkbox
          className="text-sm text-text-secondary"
          isSelected={isActive}
          onChange={setIsActive}
          isDisabled={busy}
        >
          Đang sử dụng
        </Checkbox>
        <p className="text-xs text-text-tertiary">
          Tên đã có trong hồ sơ không thể đổi hoặc xóa. Có thể ngừng sử dụng để
          ẩn khỏi danh sách chọn mới.
        </p>
      </DialogBody>
      <DialogFooter>
        <Button
          appearance="outline"
          size="sm"
          onPress={onCancel}
          isDisabled={busy}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          size="sm"
          isDisabled={busy || !code.trim() || !name.trim()}
        >
          {busy ? "Đang lưu…" : "Lưu danh mục"}
        </Button>
      </DialogFooter>
    </form>
  );
}
