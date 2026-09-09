import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/tailgrids/core/badge";

import type { SegmentStudent } from "./segment-detail-types";
import {
  getSegmentLevelBadgeColor,
  getSegmentLevelLabel,
  getStudentStageBadgeColor,
  getStudentStageLabel,
} from "./segment-filter-config";

export const segmentStudentColumns: ColumnDef<SegmentStudent>[] = [
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
      >
        {getStudentStageLabel(row.original.stage)}
      </Badge>
    ),
  },
  {
    accessorKey: "major",
    header: "Ngành quan tâm",
    cell: ({ row }) => (
      <span className="inline-block min-w-40">{row.original.major || "—"}</span>
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
];
