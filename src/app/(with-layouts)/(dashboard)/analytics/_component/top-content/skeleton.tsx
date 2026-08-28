import { Skeleton } from "@/components/tailgrids/core/skeleton";
import { TableCell, TableRow } from "@/components/tailgrids/core/table";

export function TopContentSkeletonRow() {
  return (
    <TableRow className="[&_td]:border-none">
      <TableCell className="px-6 py-3.5">
        <Skeleton className="h-3.5 w-40" />
      </TableCell>
      <TableCell className="px-6 py-3.5">
        <Skeleton className="h-3.5 w-16" />
      </TableCell>
      <TableCell className="px-6 py-3.5">
        <Skeleton className="h-3.5 w-16" />
      </TableCell>
    </TableRow>
  );
}
