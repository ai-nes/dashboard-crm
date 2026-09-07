import { ChevronLeft, Plus } from "@tailgrids/icons";
import Link from "next/link";
import { Button } from "@/components/tailgrids/core/button";

import type { BigTeam, SmallTeam } from "./types";

interface SmallTeamDetailHeaderProps {
  bigTeam: BigTeam;
  smallTeam: SmallTeam;
  onCreate: () => void;
}

export default function SmallTeamDetailHeader({
  bigTeam,
  smallTeam,
  onCreate,
}: SmallTeamDetailHeaderProps) {
  return (
    <header className="rounded-2xl border border-card-border bg-card-background p-5 lg:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href={`/lead-sale/team-management/${encodeURIComponent(bigTeam.id)}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-text-tertiary hover:text-text-primary"
          >
            <ChevronLeft size={14} aria-hidden="true" />
            Quay lại {bigTeam.name}
          </Link>
          <h1 className="mt-3 text-balance text-2xl leading-8 font-semibold tracking-[-0.4px] text-text-primary lg:text-[28px]">
            {smallTeam.name}
          </h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Thuộc {bigTeam.name}
          </p>
        </div>
        <Button size="sm" onPress={onCreate} className="shrink-0">
          <Plus size={16} aria-hidden="true" />
          Thêm thành viên
        </Button>
      </div>
    </header>
  );
}
