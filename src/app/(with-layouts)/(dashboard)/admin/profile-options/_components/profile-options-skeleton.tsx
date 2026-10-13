import {
  ADMIN_TABLE_PAGE_SIZE,
  AdminTableBody,
  AdminTableCell,
  AdminTableFooter,
  AdminTableFrame,
  AdminTableRoot,
  AdminTableRow,
} from "@/components/common/admin/admin-table";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import ProfileOptionsTableHeader from "./profile-options-table-header";

export function ProfileOptionsRowsSkeleton() {
  return Array.from({ length: ADMIN_TABLE_PAGE_SIZE }, (_, index) => (
    <AdminTableRow key={index}>
      <AdminTableCell>
        <Skeleton className="h-3 w-32 max-w-full" />
      </AdminTableCell>
      <AdminTableCell>
        <Skeleton className={`h-4 max-w-full ${index % 2 ? "w-40" : "w-48"}`} />
      </AdminTableCell>
      <AdminTableCell>
        <Skeleton className="h-4 w-6" />
      </AdminTableCell>
      <AdminTableCell>
        <Skeleton className="h-5 w-24 rounded-md" />
      </AdminTableCell>
      <AdminTableCell>
        <Skeleton className="ml-auto size-9 rounded-lg" />
      </AdminTableCell>
    </AdminTableRow>
  ));
}

export function ProfileOptionsPaginationSkeleton() {
  return (
    <AdminTableFooter aria-hidden="true" className="px-5 py-4">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="h-10 w-32 rounded-lg" />
    </AdminTableFooter>
  );
}

export default function ProfileOptionsPageSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Đang tải danh mục hồ sơ"
      className="space-y-5 p-4 sm:p-6"
    >
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </header>
      <div className="flex gap-6 overflow-hidden border-b border-card-border py-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-4 w-20 shrink-0" />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-9 w-full rounded-lg sm:w-80" />
        <Skeleton className="h-9 w-44 rounded-lg" />
      </div>
      <AdminTableFrame>
        <AdminTableRoot>
          <ProfileOptionsTableHeader />
          <AdminTableBody>
            <ProfileOptionsRowsSkeleton />
          </AdminTableBody>
        </AdminTableRoot>
        <ProfileOptionsPaginationSkeleton />
      </AdminTableFrame>
    </main>
  );
}
