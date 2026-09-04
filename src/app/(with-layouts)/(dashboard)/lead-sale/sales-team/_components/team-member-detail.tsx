"use client";

import { ArrowRight, Check, ClockThree, InfoTriangle } from "@tailgrids/icons";
import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import DetailDrawer from "../../student-assignment/_components/detail-drawer";
import {
  availabilityColors,
  availabilityLabels,
  healthColors,
  healthLabels,
} from "./mappings";
import type { SalesTeamMember } from "./types";

interface TeamMemberDetailProps {
  member: SalesTeamMember | null;
  onClose: () => void;
}

export default function TeamMemberDetail({
  member,
  onClose,
}: TeamMemberDetailProps) {
  if (!member) return null;

  return (
    <DetailDrawer
      title={member.name}
      subtitle="CHI TIẾT THÀNH VIÊN"
      onClose={onClose}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge color={availabilityColors[member.availability]}>
          {availabilityLabels[member.availability]}
        </Badge>
        <Badge color={healthColors[member.health]}>
          {healthLabels[member.health]}
        </Badge>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-badge-sky-background text-sm font-semibold text-badge-sky-text">
          {member.initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-text-primary">
            {member.name}
          </p>
          <p className="mt-1 truncate text-sm text-text-tertiary">
            {member.email}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-background-gray-secondary p-3">
          <p className="text-xs text-text-tertiary">Phụ trách</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-text-primary">
            {member.activeStudents}
          </p>
          <p className="mt-0.5 text-[11px] text-text-tertiary">
            /{member.capacity} khả năng tiếp nhận
          </p>
        </div>
        <div className="rounded-xl bg-background-gray-secondary p-3">
          <p className="text-xs text-text-tertiary">Đã tư vấn</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-text-primary">
            {member.consultedToday}
          </p>
          <p className="mt-0.5 text-[11px] text-text-tertiary">hôm nay</p>
        </div>
        <div className="rounded-xl bg-background-gray-secondary p-3">
          <p className="text-xs text-text-tertiary">Nhập học</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-badge-success-text">
            {member.admittedThisMonth}
          </p>
          <p className="mt-0.5 text-[11px] text-text-tertiary">trong tháng</p>
        </div>
      </div>

      {member.health === "support" && (
        <div className="mt-6 flex gap-3 rounded-xl bg-badge-warning-background p-4 text-badge-warning-text">
          <InfoTriangle
            size={18}
            className="mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-semibold">Cần được theo dõi</p>
            <p className="mt-1 text-sm leading-6">{member.supportReason}</p>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">
            Phạm vi phụ trách
          </h3>
          <ul className="mt-3 space-y-2.5">
            <li className="flex gap-2 text-sm leading-6 text-text-secondary">
              <Check
                size={16}
                className="mt-1 shrink-0 text-badge-success-text"
                aria-hidden="true"
              />
              Khu vực: {member.regions.join(", ")}.
            </li>
            {member.specialties.map((specialty) => (
              <li
                key={specialty}
                className="flex gap-2 text-sm leading-6 text-text-secondary"
              >
                <Check
                  size={16}
                  className="mt-1 shrink-0 text-badge-success-text"
                  aria-hidden="true"
                />
                Nhóm ngành: {specialty}.
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-card-border p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <ClockThree size={17} aria-hidden="true" />
              Tình hình xử lý
            </div>
            <span className="text-xs text-text-tertiary">
              {member.lastActivity}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-text-tertiary">Tỷ lệ nhập học</p>
              <p className="mt-1 font-semibold tabular-nums text-text-primary">
                {member.conversionRate}%
              </p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Quá hạn liên hệ</p>
              <p
                className={
                  member.overdue
                    ? "mt-1 font-semibold tabular-nums text-badge-warning-text"
                    : "mt-1 font-semibold tabular-nums text-badge-success-text"
                }
              >
                {member.overdue || "Không có"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        <Link
          href={`/lead-sale/students?owner=${member.id}`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-button-primary-background px-4 text-sm font-semibold text-button-primary-text transition-colors hover:bg-button-primary-hover-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          Xem học sinh
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
        <Button
          appearance="outline"
          className="h-11 border-card-border text-text-secondary"
          onPress={onClose}
        >
          Đóng chi tiết
        </Button>
      </div>
    </DetailDrawer>
  );
}
