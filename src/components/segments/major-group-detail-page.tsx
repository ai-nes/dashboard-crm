"use client";

import { ArrowLeft } from "@tailgrids/icons";
import Link from "next/link";
import { useMemo } from "react";

import { useAuth } from "@/components/common/auth/auth-provider";
import AdminPageHeader from "@/components/common/admin/admin-page-header";
import { Badge } from "@/components/tailgrids/core/badge";
import { useMajorGroupsQuery } from "@/hooks/use-major-catalog-queries";

import { MajorCatalogManagement } from "./major-catalog-management";
import { canManageMajorCatalog } from "./student-configuration-permissions";

const GROUPS_PAGE_SIZE = 100;

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : "Không thể tải thông tin Major Group.";
}

export function MajorGroupDetailPage({ groupId }: { groupId: string }) {
  const { user } = useAuth();
  const canManage = canManageMajorCatalog(user?.roles);
  const groupsQuery = useMajorGroupsQuery({
    includeDisabled: true,
    start: 0,
    pageLength: GROUPS_PAGE_SIZE,
  });
  const group = useMemo(
    () => groupsQuery.data?.groups.find((item) => item.id === groupId),
    [groupId, groupsQuery.data?.groups],
  );

  if (groupsQuery.isPending) {
    return (
      <main id="main-content" className="px-2 py-4 lg:px-6">
        <section
          className="rounded-2xl border border-card-border bg-card-background p-6 text-sm text-text-secondary"
          role="status"
        >
          Đang tải thông tin Major Group…
        </section>
      </main>
    );
  }

  if (groupsQuery.error || !group) {
    return (
      <main id="main-content" className="px-2 py-4 lg:px-6">
        <section className="rounded-2xl border border-card-border bg-card-background p-6">
          <h1 className="text-xl font-semibold text-text-primary">
            Không tìm thấy Major Group
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            {groupsQuery.error
              ? errorMessage(groupsQuery.error)
              : "Nhóm ngành không tồn tại hoặc đã bị xóa."}
          </p>
          <Link
            href="/director/admin/majors"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-500 hover:underline"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Quay lại danh sách Major Group
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      className="flex min-h-0 min-w-0 flex-col gap-5 px-2 py-4 lg:h-full lg:overflow-hidden lg:px-6"
    >
      <AdminPageHeader
        section="Học sinh"
        title={group.name}
        description="Quản lý các Major thuộc Major Group này."
        canEdit={canManage}
        before={
          <Link
            href="/director/admin/majors"
            className="inline-flex items-center gap-1.5 rounded text-xs font-medium text-text-secondary outline-none hover:text-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Quay lại danh sách Major Group
          </Link>
        }
        details={
          <div className="flex flex-wrap items-center gap-3 text-xs text-text-tertiary">
            <span className="font-mono font-medium tracking-wide">
              {group.code}
            </span>
            <Badge color={group.enabled ? "success" : "gray"}>
              {group.enabled ? "Đang dùng" : "Đã tắt"}
            </Badge>
            <span>{group.description || "Chưa có mô tả"}</span>
          </div>
        }
        metaLabel="Danh mục ngành học"
        metaValue="Các Major được phân loại trong nhóm này"
      />
      <MajorCatalogManagement
        canManage={canManage}
        groupId={group.id}
        groupName={group.name}
      />
    </main>
  );
}
