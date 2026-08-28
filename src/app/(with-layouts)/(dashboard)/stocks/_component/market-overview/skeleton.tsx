import { Skeleton } from "@/components/tailgrids/core/skeleton";
import { TableCell, TableRow } from "@/components/tailgrids/core/table";

export function MarketOverviewSkeletonRow() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-3.5 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-10" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-14" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-12" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-16" />
      </TableCell>
    </TableRow>
  );
}
