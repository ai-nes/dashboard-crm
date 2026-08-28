import { Skeleton } from "@/components/tailgrids/core/skeleton";
import { TableCell, TableRow } from "@/components/tailgrids/core/table";

export function TopUsageSkeletonRow() {
  return (
    <TableRow className="[&_td]:border-none">
      <TableCell className="px-5 py-3.5">
        <Skeleton className="mb-1.5 h-3.5 w-28" />
        <Skeleton className="h-3 w-16" />
      </TableCell>
      <TableCell className="px-5 py-3.5">
        <Skeleton className="h-3.5 w-16" />
      </TableCell>
      <TableCell className="px-5 py-3.5">
        <Skeleton className="h-3.5 w-16" />
      </TableCell>
    </TableRow>
  );
}
