"use client";

import { ArrowRight, Search1 } from "@tailgrids/icons";
import { Label } from "react-aria-components";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { Input } from "@/components/tailgrids/core/input";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { TextField } from "@/components/tailgrids/core/text-field";
import {
  availabilityColors,
  availabilityLabels,
  healthColors,
  healthLabels,
} from "./mappings";
import type {
  SalesTeamMember,
  TeamAvailabilityFilter,
  TeamSort,
} from "./types";

interface TeamMemberTableProps {
  members: SalesTeamMember[];
  query: string;
  onQueryChange: (value: string) => void;
  availability: TeamAvailabilityFilter;
  onAvailabilityChange: (value: TeamAvailabilityFilter) => void;
  sort: TeamSort;
  onSortChange: (value: TeamSort) => void;
  onSelect: (member: SalesTeamMember) => void;
  onReset: () => void;
}

const availabilityOptions: { id: TeamAvailabilityFilter; label: string }[] = [
  { id: "all", label: "Tất cả trạng thái" },
  { id: "active", label: "Đang hoạt động" },
  { id: "away", label: "Ngoại tuyến" },
  { id: "leave", label: "Tạm nghỉ" },
];

const sortOptions: { id: TeamSort; label: string }[] = [
  { id: "support", label: "Ưu tiên cần hỗ trợ" },
  { id: "load", label: "Đang phụ trách nhiều nhất" },
  { id: "name", label: "Tên A–Z" },
];

function LoadValue({ member }: { member: SalesTeamMember }) {
  return (
    <p className="font-semibold tabular-nums text-text-primary">
      {member.activeStudents}
      <span className="font-normal text-text-tertiary">/{member.capacity}</span>
    </p>
  );
}

export default function TeamMemberTable({
  members,
  query,
  onQueryChange,
  availability,
  onAvailabilityChange,
  sort,
  onSortChange,
  onSelect,
  onReset,
}: TeamMemberTableProps) {
  return (
    <section id="sales-team-list" aria-labelledby="sales-team-list-heading">
      <Card className="overflow-hidden p-0">
        <CardHeader className="items-start gap-4 border-b border-card-border p-5 sm:p-6">
          <div>
            <CardTitle id="sales-team-list-heading">
              Danh sách thành viên
            </CardTitle>
            <p className="mt-1 text-xs leading-5 text-text-tertiary">
              Chọn một thành viên để xem chi tiết và các chỉ số đang theo dõi.
            </p>
          </div>
          <Badge color="gray">{members.length} thành viên</Badge>
        </CardHeader>

        <div className="grid gap-3 border-b border-card-border p-4 sm:grid-cols-[minmax(0,1fr)_12rem_12rem] sm:p-5">
          <TextField
            value={query}
            onChange={onQueryChange}
            className="gap-1.5"
          >
            <Label className="sr-only">Tìm thành viên</Label>
            <div className="relative">
              <Search1
                size={16}
                aria-hidden="true"
                className="pointer-events-none absolute top-3 left-3 text-text-tertiary"
              />
              <Input
                placeholder="Tìm theo tên hoặc email"
                className="h-10 w-full pl-9 text-sm"
              />
            </div>
          </TextField>
          <Select
            value={availability}
            onChange={(value: string | number) =>
              onAvailabilityChange(String(value) as TeamAvailabilityFilter)
            }
            aria-label="Lọc theo trạng thái"
          >
            <SelectTrigger className="h-10 w-full text-sm">
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent>
              {availabilityOptions.map((option) => (
                <SelectItem
                  key={option.id}
                  id={option.id}
                  textValue={option.label}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sort}
            onChange={(value: string | number) =>
              onSortChange(String(value) as TeamSort)
            }
            aria-label="Sắp xếp danh sách thành viên"
          >
            <SelectTrigger className="h-10 w-full text-sm">
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem
                  key={option.id}
                  id={option.id}
                  textValue={option.label}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[760px] table-fixed border-collapse text-sm">
            <caption className="sr-only">
              Danh sách thành viên đội ngũ Sale
            </caption>
            <colgroup>
              <col className="w-[30%]" />
              <col className="w-[17%]" />
              <col className="w-[16%]" />
              <col className="w-[12%]" />
              <col className="w-[11%]" />
              <col className="w-[14%]" />
            </colgroup>
            <thead className="border-b border-card-border bg-background-gray-secondary/60 text-xs text-text-tertiary">
              <tr>
                <th scope="col" className="px-5 py-3 text-left font-medium">
                  Thành viên
                </th>
                <th scope="col" className="px-3 py-3 text-left font-medium">
                  Trạng thái
                </th>
                <th scope="col" className="px-3 py-3 text-left font-medium">
                  Đang phụ trách
                </th>
                <th scope="col" className="px-3 py-3 text-center font-medium">
                  Đã tư vấn
                </th>
                <th scope="col" className="px-3 py-3 text-center font-medium">
                  Nhập học
                </th>
                <th scope="col" className="px-3 py-3 text-left font-medium">
                  Đánh giá
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {members.map((member) => (
                <tr key={member.id} className="align-middle">
                  <td className="px-5 py-4">
                    <Button
                      appearance="ghost"
                      className="h-auto w-full justify-start gap-3 px-0 text-left text-text-primary hover:bg-transparent"
                      onPress={() => onSelect(member)}
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-badge-sky-background text-xs font-semibold text-badge-sky-text">
                        {member.initials}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">
                          {member.name}
                        </span>
                        <span className="mt-1 block truncate text-xs font-normal text-text-tertiary">
                          {member.email}
                        </span>
                      </span>
                    </Button>
                  </td>
                  <td className="px-3 py-4">
                    <Badge color={availabilityColors[member.availability]}>
                      {availabilityLabels[member.availability]}
                    </Badge>
                  </td>
                  <td className="px-3 py-4">
                    <LoadValue member={member} />
                  </td>
                  <td className="px-3 py-4 text-center font-semibold tabular-nums text-text-primary">
                    {member.consultedToday}
                  </td>
                  <td className="px-3 py-4 text-center font-semibold tabular-nums text-badge-success-text">
                    {member.admittedThisMonth}
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center justify-between gap-2">
                      <Badge color={healthColors[member.health]}>
                        {healthLabels[member.health]}
                      </Badge>
                      <Button
                        appearance="ghost"
                        size="sm"
                        iconOnly
                        aria-label={`Xem chi tiết ${member.name}`}
                        className="text-text-tertiary"
                        onPress={() => onSelect(member)}
                      >
                        <ArrowRight size={15} aria-hidden="true" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-card-border lg:hidden">
          {members.map((member) => (
            <div key={member.id} className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <Button
                  appearance="ghost"
                  className="h-auto min-w-0 justify-start gap-3 px-0 text-left text-text-primary hover:bg-transparent"
                  onPress={() => onSelect(member)}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-badge-sky-background text-xs font-semibold text-badge-sky-text">
                    {member.initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      {member.name}
                    </span>
                    <span className="mt-1 block truncate text-xs font-normal text-text-tertiary">
                      {member.email}
                    </span>
                  </span>
                </Button>
                <Badge color={healthColors[member.health]}>
                  {healthLabels[member.health]}
                </Badge>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-background-gray-secondary px-3 py-2">
                  <p className="text-[11px] text-text-tertiary">Phụ trách</p>
                  <p className="mt-1 text-sm font-semibold tabular-nums text-text-primary">
                    {member.activeStudents}/{member.capacity}
                  </p>
                </div>
                <div className="rounded-lg bg-background-gray-secondary px-3 py-2">
                  <p className="text-[11px] text-text-tertiary">Đã tư vấn</p>
                  <p className="mt-1 text-sm font-semibold tabular-nums text-text-primary">
                    {member.consultedToday}
                  </p>
                </div>
                <div className="rounded-lg bg-background-gray-secondary px-3 py-2">
                  <p className="text-[11px] text-text-tertiary">Nhập học</p>
                  <p className="mt-1 text-sm font-semibold tabular-nums text-badge-success-text">
                    {member.admittedThisMonth}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <Badge color={availabilityColors[member.availability]}>
                  {availabilityLabels[member.availability]}
                </Badge>
                <Button
                  appearance="ghost"
                  size="sm"
                  className="text-text-secondary"
                  onPress={() => onSelect(member)}
                >
                  Xem chi tiết
                  <ArrowRight size={14} aria-hidden="true" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {!members.length && (
          <div className="px-5 py-12 text-center">
            <Search1
              size={24}
              className="mx-auto text-text-tertiary"
              aria-hidden="true"
            />
            <p className="mt-3 text-sm font-medium text-text-primary">
              Không tìm thấy thành viên
            </p>
            <p className="mt-1 text-xs text-text-tertiary">
              Thử đổi từ khóa hoặc bộ lọc trạng thái.
            </p>
            <Button
              appearance="ghost"
              size="sm"
              className="mt-3"
              onPress={onReset}
            >
              Xóa bộ lọc
            </Button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-card-border px-5 py-3 text-xs text-text-tertiary">
          <span>Chọn thành viên để xem chỉ số chi tiết.</span>
          <span className="tabular-nums">Cập nhật lúc 09:45 · 05/09/2026</span>
        </div>
      </Card>
    </section>
  );
}
