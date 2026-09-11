"use client";

import { CRM_ROLES } from "@/components/common/auth/rbac";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";

// "Business Admin" is a historical role name kept only for legacy route
// access; it is not assignable through crm.api.user.update_user_role.
export const ASSIGNABLE_CRM_ROLES = CRM_ROLES.filter((role) => role !== "Business Admin");

interface RoleSelectDropdownProps {
  value: string;
  disabled?: boolean;
  onChange: (role: string) => void;
}

export default function RoleSelectDropdown({ value, disabled = false, onChange }: RoleSelectDropdownProps) {
  const hasKnownRole = ASSIGNABLE_CRM_ROLES.includes(value as (typeof ASSIGNABLE_CRM_ROLES)[number]);

  return (
    <Select
      value={hasKnownRole ? value : undefined}
      onChange={(next) => onChange(String(next))}
      isDisabled={disabled}
      placeholder={value || "Chưa có vai trò"}
      aria-label="Đổi vai trò"
      className="min-w-0 sm:w-40"
    >
      <SelectTrigger size="sm" className="w-full">
        <SelectValue />
        <SelectIndicator />
      </SelectTrigger>
      <SelectContent>
        {ASSIGNABLE_CRM_ROLES.map((role) => (
          <SelectItem key={role} id={role} textValue={role}>
            {role}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
