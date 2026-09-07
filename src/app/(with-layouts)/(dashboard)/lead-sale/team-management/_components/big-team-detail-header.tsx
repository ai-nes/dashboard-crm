"use client";

import { ChevronLeft, Plus } from "@tailgrids/icons";
import Link from "next/link";

import { Button } from "@/components/tailgrids/core/button";
import type { BigTeam } from "./types";

interface BigTeamDetailHeaderProps {
  bigTeam: BigTeam;
  onCreate: () => void;
}

export default function BigTeamDetailHeader({
  bigTeam,
  onCreate,
}: BigTeamDetailHeaderProps) {
  return (
    <header className="rounded-2xl border border-card-border bg-card-background p-5 lg:p-7 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <Link
          href="/lead-sale/team-management"
          className="inline-flex items-center gap-1 text-xs font-medium text-text-tertiary hover:text-text-primary"
        >
          <ChevronLeft size={14} aria-hidden="true" />
          Quay lại danh sách đội
        </Link>

        <h1 className="mt-3 text-balance text-2xl leading-8 font-semibold tracking-[-0.4px] text-text-primary lg:text-[28px]">
          {bigTeam.name}
        </h1>
      </div>
      <Button onPress={onCreate} className="shrink-0 self-start">
        <Plus size={16} aria-hidden="true" />
        Tạo nhóm
      </Button>
    </header>
  );
}
