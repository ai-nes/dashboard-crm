"use client";

import { Plus, Search1 } from "@tailgrids/icons";
import { useMemo, useState } from "react";
import { Menu, MenuTrigger } from "react-aria-components";

import { Button } from "@/components/tailgrids/core/button";
import { DropdownMenuItem } from "@/components/tailgrids/core/dropdown";
import { Input } from "@/components/tailgrids/core/input";
import { Popover } from "@/components/tailgrids/core/popover";

import type { TeamMember } from "./types";

interface AddMemberDropdownProps {
  teamName: string;
  candidates: TeamMember[];
  onSubmit: (memberId: string) => void;
  isDisabled?: boolean;
}

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

export default function AddMemberDropdown({
  teamName,
  candidates,
  onSubmit,
  isDisabled = false,
}: AddMemberDropdownProps) {
  const [query, setQuery] = useState("");
  const filteredCandidates = useMemo(() => {
    const normalizedQuery = normalize(query.trim());
    if (!normalizedQuery) return candidates;
    return candidates.filter((member) =>
      normalize(member.name).includes(normalizedQuery),
    );
  }, [candidates, query]);

  const handleSelect = (memberId: string) => {
    setQuery("");
    onSubmit(memberId);
  };

  return (
    <MenuTrigger>
      <Button
        size="sm"
        isDisabled={isDisabled}
        aria-label={`Thêm thành viên vào ${teamName}`}
      >
        <Plus size={16} aria-hidden="true" />
        Thêm thành viên
      </Button>
      <Popover
        placement="bottom end"
        className="w-80 overflow-hidden p-2 shadow-md"
      >
        <div className="relative">
          <Search1
            size={14}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-icon-tertiary"
          />
          <Input
            autoFocus
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm thành viên..."
            aria-label={`Tìm thành viên trong ${teamName}`}
            className="h-9 w-full pl-8 text-sm"
          />
        </div>
        <Menu
          aria-label={`Danh sách thành viên có thể thêm vào ${teamName}`}
          className="mt-1 max-h-64 overflow-y-auto outline-none"
        >
          {filteredCandidates.length > 0 ? (
            filteredCandidates.map((member) => (
              <DropdownMenuItem
                key={member.id}
                id={member.id}
                textValue={member.name}
                onAction={() => handleSelect(member.id)}
              >
                <span className="min-w-0 flex-1 truncate">{member.name}</span>
              </DropdownMenuItem>
            ))
          ) : (
            <li className="px-3 py-3 text-sm text-text-tertiary">
              {candidates.length > 0
                ? "Không tìm thấy nhân sự phù hợp."
                : "Không còn nhân sự phù hợp để thêm vào Team này."}
            </li>
          )}
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}
