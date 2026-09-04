"use client";

import {
  CheckCircle1,
  ClockThree,
  InfoTriangle,
  UserMultiple1,
} from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card } from "@/components/tailgrids/core/card";
import type { SalesTeamMember } from "./types";

interface TeamOverviewProps {
  members: SalesTeamMember[];
}

export default function TeamOverview({ members }: TeamOverviewProps) {
  const activeMembers = members.filter(
    (member) => member.availability === "active",
  ).length;
  const assignedStudents = members.reduce(
    (total, member) => total + member.activeStudents,
    0,
  );
  const totalCapacity = members.reduce(
    (total, member) => total + member.capacity,
    0,
  );
  const supportMembers = members.filter(
    (member) => member.health === "support",
  ).length;
  const overdueStudents = members.reduce(
    (total, member) => total + member.overdue,
    0,
  );
  const loadRate = Math.round((assignedStudents / totalCapacity) * 100);

  const stats = [
    {
      label: "Thành viên",
      value: members.length,
      note: `${activeMembers} đang hoạt động`,
      icon: UserMultiple1,
      tone: "sky",
    },
    {
      label: "Học sinh đang phụ trách",
      value: assignedStudents,
      note: `${loadRate}% khả năng tiếp nhận đã dùng`,
      icon: CheckCircle1,
      tone: "primary",
    },
    {
      label: "Cần hỗ trợ",
      value: supportMembers,
      note: "thành viên cần theo dõi",
      icon: InfoTriangle,
      tone: "warning",
    },
    {
      label: "Quá hạn liên hệ",
      value: overdueStudents,
      note: "học sinh cần xử lý sớm",
      icon: ClockThree,
      tone: "error",
    },
  ] as const;

  return (
    <section
      aria-label="Tổng quan đội ngũ Sale"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <span
                className={`flex size-10 items-center justify-center rounded-xl ${
                  stat.tone === "sky"
                    ? "bg-badge-sky-background text-badge-sky-text"
                    : stat.tone === "primary"
                      ? "bg-badge-primary-background text-badge-primary-text"
                      : stat.tone === "warning"
                        ? "bg-badge-warning-background text-badge-warning-text"
                        : "bg-badge-error-background text-badge-error-text"
                }`}
              >
                <Icon size={19} aria-hidden="true" />
              </span>
              {stat.tone === "warning" && stat.value > 0 && (
                <Badge color="warning">Theo dõi</Badge>
              )}
            </div>
            <p className="mt-4 text-sm text-text-secondary">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-text-primary tabular-nums">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-text-tertiary">{stat.note}</p>
          </Card>
        );
      })}
    </section>
  );
}
