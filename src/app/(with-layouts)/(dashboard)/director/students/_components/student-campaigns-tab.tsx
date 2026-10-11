"use client";

import { useState } from "react";
import { useAuth } from "@/components/common/auth/auth-provider";
import { canReadStudentCampaigns } from "@/components/common/auth/permissions";
import { Button } from "@/components/tailgrids/core/button";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import { useStudentCampaignsQuery } from "@/hooks/use-student-campaigns-query";
import StudentCampaignsTable from "./student-campaigns-table";

export default function StudentCampaignsTab({
  studentId,
  isActive,
}: {
  studentId: string;
  isActive: boolean;
}) {
  const { user, isLoading } = useAuth();
  const canRead = !isLoading && canReadStudentCampaigns(user);
  const [page, setPage] = useState(1);
  const query = useStudentCampaignsQuery(
    studentId.trim(),
    page,
    isActive && canRead,
  );
  if (!canRead) return null;

  return (
    <section className="space-y-4" aria-label="Lịch sử chiến dịch">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Chiến dịch đã tham gia
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {query.data ? `${query.data.meta.total} chiến dịch · ` : ""}Mới nhất
            trước
          </p>
        </div>
        <Button
          size="sm"
          appearance="outline"
          onPress={() => {
            void query.refetch();
          }}
          isDisabled={query.isFetching}
        >
          Làm mới
        </Button>
      </div>
      {query.isPending ? (
        <div
          role="status"
          aria-label="Đang tải chiến dịch"
          className="space-y-4 rounded-lg border border-border-primary p-5"
        >
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-5 w-2/3" />
        </div>
      ) : query.isError ? (
        <div
          role="alert"
          className="rounded-lg border border-border-primary p-5 text-sm text-text-primary"
        >
          <p>Không thể tải lịch sử chiến dịch.</p>
          <p className="mt-1 text-text-secondary">{query.error.message}</p>
          <Button
            className="mt-3"
            size="sm"
            appearance="outline"
            onPress={() => {
              void query.refetch();
            }}
          >
            Thử lại
          </Button>
        </div>
      ) : query.data?.data.length ? (
        <>
          <StudentCampaignsTable items={query.data.data} />
          {query.data.meta.totalPages > 1 && (
            <nav
              aria-label="Phân trang chiến dịch"
              className="flex flex-wrap items-center justify-between gap-3"
            >
              <p className="text-sm text-text-secondary">
                Trang {page} / {query.data.meta.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  appearance="outline"
                  isDisabled={page === 1 || query.isFetching}
                  onPress={() => setPage(page - 1)}
                >
                  Trang trước
                </Button>
                <Button
                  size="sm"
                  appearance="outline"
                  isDisabled={!query.data.meta.hasNextPage || query.isFetching}
                  onPress={() => setPage(page + 1)}
                >
                  Trang sau
                </Button>
              </div>
            </nav>
          )}
        </>
      ) : (
        <div className="rounded-lg border border-border-primary p-5">
          <p className="text-sm font-medium text-text-primary">
            Chưa có chiến dịch được ghi nhận
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Các lần đăng ký chiến dịch gắn với Lead gốc của học sinh sẽ hiển thị
            tại đây.
          </p>
        </div>
      )}
    </section>
  );
}
