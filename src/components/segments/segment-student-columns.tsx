import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/tailgrids/core/badge";
import { TableRowLinkActions } from "@/components/common/table-row-link-actions";
import { getBusinessRouteKey } from "@/utils/business-record-route";
import { withReturnTo } from "@/utils/detail-navigation";

import type { SegmentStudent } from "./segment-detail-types";
import {
  getSegmentLevelBadgeColor,
  getSegmentLevelLabel,
  getStudentStageBadgeColor,
  getStudentStageLabel,
  getStudentStageBadgeLabel,
} from "./segment-filter-config";

export function createSegmentStudentColumns(
  returnTo?: string,
): ColumnDef<SegmentStudent>[] {
  return [
    {
      accessorKey: "code",
      header: "Mã học sinh",
      cell: ({ row }) => (
        <span className="tabular-nums text-text-secondary">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: "Học sinh",
      cell: ({ row }) => (
        <span className="whitespace-nowrap font-semibold text-text-primary">
          {row.original.name}
        </span>
      ),
    },
    {
      accessorKey: "phone",
      header: "Số điện thoại",
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.phone || "—"}</span>
      ),
    },
    {
      accessorKey: "stage",
      header: "Trạng thái",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <Badge
          color={getStudentStageBadgeColor(row.original.stage)}
          className="whitespace-nowrap"
          title={getStudentStageLabel(row.original.stage)}
        >
          {getStudentStageBadgeLabel(row.original.stage)}
        </Badge>
      ),
    },
    {
      accessorKey: "major",
      header: "Ngành quan tâm",
      cell: ({ row }) => (
        <span className="inline-block min-w-40">
          {row.original.major || "—"}
        </span>
      ),
    },
    {
      accessorKey: "potential",
      header: "Tiềm năng",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <Badge color={getSegmentLevelBadgeColor(row.original.potential)}>
          {getSegmentLevelLabel(row.original.potential)}
        </Badge>
      ),
    },
    {
      accessorKey: "intent",
      header: "Ý định",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <Badge color={getSegmentLevelBadgeColor(row.original.intent)}>
          {getSegmentLevelLabel(row.original.intent)}
        </Badge>
      ),
    },
    {
      accessorKey: "owner",
      header: "Người phụ trách",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">{row.original.owner || "—"}</span>
      ),
    },
    {
      id: "actions",
      header: "Thao tác",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <TableRowLinkActions
          label={row.original.name}
          href={withReturnTo(
            `/director/students/${encodeURIComponent(
              getBusinessRouteKey(
                row.original.code === "—" ? "" : row.original.code,
                row.original.id,
              ),
            )}`,
            returnTo,
          )}
        />
      ),
    },
  ];
}

export const segmentStudentColumns = createSegmentStudentColumns();
