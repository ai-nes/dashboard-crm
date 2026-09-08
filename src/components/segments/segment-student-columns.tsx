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

function potentialScoreTone(score: number): "success" | "warning" | "error" {
  if (score >= 75) return "success";
  if (score >= 50) return "warning";
  return "error";
}

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
  {
    accessorKey: "major",
    header: "Ngành quan tâm",
    cell: ({ row }) => (
      <span className="inline-block min-w-40">{row.original.major}</span>
    ),
  },
  {
    accessorKey: "potentialScore",
    header: "Điểm tiềm năng",
    enableGlobalFilter: false,
    cell: ({ row }) => (
      <Badge color={potentialScoreTone(row.original.potentialScore)}>
        {row.original.potentialScore}
      </Badge>
    ),
  },
  {
    accessorKey: "owner",
    header: "Người phụ trách",
    cell: ({ row }) => (
      <span className="whitespace-nowrap">{row.original.owner}</span>
    ),
  },
  {
    accessorKey: "nextAction",
    header: "Hành động tiếp theo",
    cell: ({ row }) => (
      <span className="inline-block min-w-40">{row.original.nextAction}</span>
    ),
  },
];
