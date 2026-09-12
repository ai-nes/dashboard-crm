"use client";

import { Plus } from "@tailgrids/icons";

import { DropdownField } from "@/components/common/dropdown-field";

import type { TeamMember } from "./types";

interface AddMemberDropdownProps {
  teamName: string;
  candidates: TeamMember[];
  onSubmit: (memberId: string) => void;
  isDisabled?: boolean;
}

export default function AddMemberDropdown({
  teamName,
  candidates,
  onSubmit,
  isDisabled = false,
}: AddMemberDropdownProps) {
  return (
    <DropdownField
      ariaLabel={`Thêm thành viên vào ${teamName}`}
      contentClassName="w-80"
      emptyMessage={
        candidates.length > 0
          ? "Không tìm thấy nhân sự phù hợp."
          : "Không còn nhân sự phù hợp để thêm vào Team này."
      }
      isDisabled={isDisabled}
      isSearchable
      appearance="fill"
      onChange={(nextValue) => {
        if (nextValue) onSubmit(nextValue);
      }}
      options={candidates.map((member) => ({
        id: member.id,
        label: member.name,
      }))}
      placeholder="Thêm thành viên"
      renderValue={() => (
        <span className="flex items-center gap-1.5">
          <Plus size={16} aria-hidden="true" />
          <span>Thêm thành viên</span>
        </span>
      )}
      searchPlaceholder="Tìm thành viên..."
      triggerClassName="h-8.5 border-transparent bg-button-primary-background px-3 py-1.5 text-button-primary-text hover:bg-button-primary-hover-background"
    />
  );
}
