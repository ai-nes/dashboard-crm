"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/tailgrids/core/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogFooter,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Input } from "@/components/tailgrids/core/input";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import { Combobox, ComboboxItem } from "@/components/tailgrids/core/combobox";

import LeadPickerField from "./lead-picker-field";
import type { TeamMember } from "./types";

interface CreateTeamDialogProps {
  initialName?: string;
  title: string;
  description: string;
  fieldLabel: string;
  placeholder: string;
  submitLabel: string;
  campusOptions?: { id: string; label: string }[];
  initialCampusId?: string;
  provinceOptions?: { id: string; label: string }[];
  initialProvinceId?: string;
  groupLeadOptions?: TeamMember[];
  teamLeadOptions?: TeamMember[];
  initialTeamLeadId?: string;
  onClose: () => void;
  onSubmit: (
    name: string,
    campusId?: string,
    provinceId?: string,
    teamLeadId?: string,
    groupLeadId?: string,
  ) => void;
}

export default function CreateTeamDialog({
  initialName = "",
  title,
  description,
  fieldLabel,
  placeholder,
  submitLabel,
  campusOptions = [],
  initialCampusId,
  provinceOptions = [],
  initialProvinceId,
  groupLeadOptions,
  teamLeadOptions,
  initialTeamLeadId,
  onClose,
  onSubmit,
}: CreateTeamDialogProps) {
  const [name, setName] = useState(initialName);
  const [campusId, setCampusId] = useState<string | null>(
    initialCampusId ?? null,
  );
  const [provinceId, setProvinceId] = useState<string | null>(
    initialProvinceId ?? null,
  );
  const [groupLeadId, setGroupLeadId] = useState<string | null>(null);
  const [teamLeadId, setTeamLeadId] = useState<string | null>(
    initialTeamLeadId ?? null,
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Vui lòng nhập tên.");
      return;
    }
    if (campusOptions.length > 0 && !campusId) {
      setError("Vui lòng chọn cơ sở.");
      return;
    }
    if (provinceOptions.length > 0 && !provinceId) {
      setError("Vui lòng chọn tỉnh quản lý.");
      return;
    }
    onSubmit(
      name.trim(),
      campusId ?? undefined,
      provinceId ?? undefined,
      teamLeadId ?? undefined,
      groupLeadId ?? undefined,
    );
  };

  return (
    <Backdrop isOpen onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog aria-label={title} className="max-w-100 p-0">
        <form onSubmit={handleSubmit}>
          <div className="border-b border-card-border px-5 py-4">
            <DialogTitle className="text-base font-semibold text-text-primary">
              {title}
            </DialogTitle>
            <p className="mt-1 text-xs leading-5 text-text-tertiary">
              {description}
            </p>
          </div>

          <DialogBody className="space-y-3 px-5 py-4">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-input-label-text">
                {fieldLabel}
              </span>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={placeholder}
                className="h-9 w-full px-3 py-2 text-sm"
                autoFocus
              />
            </label>
            {campusOptions.length > 0 && (
              <label className="block space-y-1">
                <span className="text-xs font-medium text-input-label-text">
                  Cơ sở
                </span>
                <Combobox
                  value={campusId}
                  onChange={(key) => setCampusId(key ? String(key) : null)}
                  aria-label="Chọn cơ sở"
                  placeholder="Chọn cơ sở hoạt động..."
                >
                  {campusOptions.map((campus) => (
                    <ComboboxItem
                      key={campus.id}
                      id={campus.id}
                      textValue={campus.label}
                    >
                      {campus.label}
                    </ComboboxItem>
                  ))}
                </Combobox>
              </label>
            )}
            {provinceOptions.length > 0 && (
              <label className="block space-y-1">
                <span className="text-xs font-medium text-input-label-text">
                  Tỉnh quản lý
                </span>
                <Combobox
                  value={provinceId}
                  onChange={(key) => setProvinceId(key ? String(key) : null)}
                  aria-label="Chọn tỉnh quản lý"
                  placeholder="Chọn tỉnh..."
                >
                  {provinceOptions.map((province) => (
                    <ComboboxItem
                      key={province.id}
                      id={province.id}
                      textValue={province.label}
                    >
                      {province.label}
                    </ComboboxItem>
                  ))}
                </Combobox>
              </label>
            )}
            {groupLeadOptions && (
              <label className="block space-y-1">
                <span className="text-xs font-medium text-input-label-text">
                  Trưởng Group
                </span>
                <LeadPickerField
                  candidates={groupLeadOptions}
                  value={groupLeadId}
                  onChange={setGroupLeadId}
                  ariaLabel="Chọn trưởng Group"
                  placeholder={
                    groupLeadOptions.length > 0
                      ? "Chọn trưởng Group..."
                      : "Chưa có nhân sự để chọn"
                  }
                  isDisabled={groupLeadOptions.length === 0}
                />
              </label>
            )}
            {teamLeadOptions && (
              <label className="block space-y-1">
                <span className="text-xs font-medium text-input-label-text">
                  Trưởng nhóm
                </span>
                <LeadPickerField
                  candidates={teamLeadOptions}
                  value={teamLeadId}
                  onChange={setTeamLeadId}
                  ariaLabel="Chọn trưởng nhóm"
                  placeholder={
                    teamLeadOptions.length > 0
                      ? "Chọn trưởng nhóm..."
                      : "Chưa có thành viên để chọn"
                  }
                  isDisabled={teamLeadOptions.length === 0}
                />
              </label>
            )}
            {error && <p className="text-xs text-badge-error-text">{error}</p>}
          </DialogBody>

          <DialogFooter className="border-t border-card-border px-5 py-3">
            <DialogClose appearance="outline" size="sm" type="button">
              Hủy
            </DialogClose>
            <Button type="submit" size="sm">
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </Backdrop>
  );
}
