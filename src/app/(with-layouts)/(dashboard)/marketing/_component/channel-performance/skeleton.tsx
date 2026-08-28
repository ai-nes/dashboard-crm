import { Skeleton } from "@/components/tailgrids/core/skeleton";
import { TableCell, TableRow } from "@/components/tailgrids/core/table";

export function ChannelPerformanceSkeletonRow() {
  return (
    <TableRow className="[&_td]:border-none">
      <TableCell className="px-6 py-3.5">
        <Skeleton className="h-3.5 w-28" />
      </TableCell>
      <TableCell className="px-6 py-3.5">
        <Skeleton className="h-3.5 w-16" />
      </TableCell>
      <TableCell className="px-6 py-3.5">
        <Skeleton className="h-3.5 w-16" />
      </TableCell>
      <TableCell className="px-6 py-3.5">
        <Skeleton className="h-3.5 w-14" />
      </TableCell>
      <TableCell className="px-6 py-3.5">
        <Skeleton className="h-3.5 w-20" />
      </TableCell>
    </TableRow>
  );
}
