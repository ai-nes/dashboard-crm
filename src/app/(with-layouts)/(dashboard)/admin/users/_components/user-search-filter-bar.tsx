"use client";

import { Search1 } from "@tailgrids/icons";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";

import { ASSIGNABLE_CRM_ROLES } from "./role-select-dropdown";

interface UserSearchFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  role: string;
  onRoleChange: (value: string) => void;
}

export default function UserSearchFilterBar({
  search,
  onSearchChange,
  role,
  onRoleChange,
}: UserSearchFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-card-border px-4 py-3">
      <InputGroup className="h-9 w-full sm:max-w-md">
        <InputGroupAddon align="inline-start" className="pr-0 text-icon-tertiary">
          <Search1 size={17} aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          aria-label="Tìm người dùng theo tên hoặc email"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tìm theo tên hoặc email…"
          className="pl-2 text-sm"
        />
      </InputGroup>

      <Select
        value={role}
        onChange={(value) => onRoleChange(String(value))}
        aria-label="Lọc theo vai trò"
        className="min-w-0 sm:w-48"
      >
        <SelectTrigger size="sm" className="w-full">
          <SelectValue />
          <SelectIndicator />
        </SelectTrigger>
        <SelectContent>
          <SelectItem id="all" textValue="Tất cả vai trò">
            Tất cả vai trò
          </SelectItem>
          <SelectItem id="System Manager" textValue="System Manager">
            System Manager
          </SelectItem>
          {ASSIGNABLE_CRM_ROLES.map((option) => (
            <SelectItem key={option} id={option} textValue={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
