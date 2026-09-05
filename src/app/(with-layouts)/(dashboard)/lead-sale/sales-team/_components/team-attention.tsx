"use client";

import { ArrowRight, CheckCircle1 } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { healthColors, healthLabels } from "./mappings";
import type { TeamAttentionMember } from "./types";

interface TeamAttentionProps {
  members: TeamAttentionMember[];
  onSelect: (memberId: string) => void;
}

export default function TeamAttention({
  members,
  onSelect,
}: TeamAttentionProps) {
  return (
    <Card className="min-w-0 p-5 sm:p-6">
      <CardHeader className="items-start">
        <div>
          <CardTitle>Cần hỗ trợ</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Ưu tiên xem những thành viên đang có dấu hiệu quá tải hoặc chậm xử lý.
          </p>
        </div>
        <Badge color={members.length ? "warning" : "success"}>
          {members.length} thành viên
        </Badge>
      </CardHeader>

      {members.length ? (
        <div className="mt-5 divide-y divide-card-border">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-badge-warning-background text-xs font-semibold text-badge-warning-text">
                {member.initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold text-text-primary">
                    {member.name}
                  </p>
                  <Badge color={healthColors[member.health]} size="sm">
                    {healthLabels[member.health]}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-text-tertiary">
                  {member.supportReason}
                </p>
              </div>
              <Button
                appearance="ghost"
                size="sm"
                className="shrink-0 text-text-secondary"
                onPress={() => onSelect(member.id)}
              >
                Xem chi tiết
                <ArrowRight size={14} aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 flex items-center gap-3 rounded-xl bg-badge-success-background p-4 text-sm text-badge-success-text">
          <CheckCircle1 size={19} aria-hidden="true" />
          Đội ngũ đang được theo dõi ổn định.
        </div>
      )}
    </Card>
  );
}
