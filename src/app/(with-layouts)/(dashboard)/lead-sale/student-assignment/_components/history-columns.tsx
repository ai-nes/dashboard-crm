import type { ColumnDef } from "@tanstack/react-table";
import { ArrowRight } from "@tailgrids/icons";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { candidates } from "./data";
import { statusColors, statusLabels } from "./mappings";
import type { AssignmentRecord } from "./types";

export function historyColumns(
  inspect: (id: string) => void,
): ColumnDef<AssignmentRecord>[] {
  return [
    {
      accessorKey: "name",
      header: "Học sinh",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background-gray-secondary text-xs font-semibold text-text-secondary">
            {row.original.initials}
          </span>
          <div>
            <p className="font-medium text-text-primary">{row.original.name}</p>
            <p className="mt-1 text-xs text-text-tertiary">
              {row.original.school}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "ownerId",
      header: "Người phụ trách",
      cell: ({ row }) => {
        const owner = candidates.find(
          (person) => person.id === row.original.ownerId,
        );
        return owner ? (
          <div>
            <p className="text-text-primary">{owner.name}</p>
            <p className="mt-1 text-xs text-text-tertiary">
              {row.original.method === "manual"
                ? "Trưởng nhóm phân công"
                : "Tự động phân công"}
            </p>
          </div>
        ) : (
          <span className="text-text-tertiary">Chưa phân công</span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Kết quả",
      cell: ({ row }) => (
        <Badge
          color={statusColors[row.original.status]}
          className="whitespace-nowrap"
        >
          {statusLabels[row.original.status]}
        </Badge>
      ),
    },
    {
      accessorKey: "time",
      header: "Tiếp nhận",
      cell: ({ row }) => (
        <span className="tabular-nums text-text-secondary">
          {row.original.time}
        </span>
      ),
    },
    {
      id: "detail",
      header: () => <span className="sr-only">Thao tác</span>,
      cell: ({ row }) => (
        <Button
          appearance="ghost"
          size="sm"
          className="ml-auto gap-1 px-1 text-text-secondary"
          aria-label={`Xem chi tiết ${row.original.name}`}
          onPress={() => inspect(row.original.id)}
        >
          Chi tiết
          <ArrowRight size={14} aria-hidden="true" />
        </Button>
      ),
    },
  ];
}
