import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/tailgrids/core/badge";
import { JOURNEY_STAGE_LABEL, JourneyStage } from "./segment-filter-config";
import type { SegmentStudent } from "./segment-detail-types";

const STAGE_COLORS = {
  [JourneyStage.NEW]: "sky",
  [JourneyStage.ATTEMPTING]: "warning",
  [JourneyStage.CONNECTED]: "violet",
  [JourneyStage.QUALIFIED]: "success",
  [JourneyStage.DISQUALIFIED]: "gray",
} as const;

export const segmentStudentColumns: ColumnDef<SegmentStudent>[] = [
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
    accessorKey: "school",
    header: "Trường THPT",
    cell: ({ row }) => (
      <span className="inline-block min-w-40">{row.original.school}</span>
    ),
  },
  {
    accessorKey: "phone",
    header: "Số điện thoại",
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.phone}</span>
    ),
  },
  {
    accessorKey: "stage",
    header: "Trạng thái",
    enableGlobalFilter: false,
    cell: ({ row }) => (
      <Badge
        color={STAGE_COLORS[row.original.stage]}
        className="whitespace-nowrap"
      >
        {JOURNEY_STAGE_LABEL[row.original.stage]}
      </Badge>
    ),
  },
];
