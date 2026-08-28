import { Skeleton } from "@/components/tailgrids/core/skeleton";
import { TableCell, TableRow } from "@/components/tailgrids/core/table";

export function LeadsReportSkeletonRow() {
  return (
    <TableRow className="[&_td]:border-none">
      <TableCell className="px-6 py-3.5">
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <Skeleton className="h-3.5 w-28" />
        </div>
      </TableCell>
      <TableCell className="px-6 py-3.5">
        <Skeleton className="h-3.5 w-10" />
      </TableCell>
      <TableCell className="px-6 py-3.5">
        <Skeleton className="h-3.5 w-20" />
      </TableCell>
      <TableCell className="px-6 py-3.5">
        <Skeleton className="h-3.5 w-24" />
      </TableCell>
    </TableRow>
  );
}
