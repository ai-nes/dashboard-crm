import type { Metadata } from "next";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card } from "@/components/tailgrids/core/card";
import StudentCardEmptyState from "@/app/(with-layouts)/(dashboard)/director/students/_components/student-card-empty-state";

export const metadata: Metadata = {
  title: "Đội ngũ Sale",
  description: "Theo dõi hiệu suất và tình trạng làm việc của đội ngũ Sale.",
};

export default function LeadSaleSalesTeamPage() {
  return (
    <main className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6">
      <header className="rounded-xl border border-card-border bg-card-background p-5 lg:p-6">
        <Badge color="primary">LEAD SALE · FAIP</Badge>
        <h1 className="mt-3 text-balance text-[28px] leading-8 font-semibold tracking-[-0.4px] text-text-primary">
          Đội ngũ Sale
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
          Theo dõi hiệu suất và tình trạng làm việc của đội ngũ Sale. Màn hình
          đang được thiết kế.
        </p>
      </header>
      <Card className="p-5 lg:p-6">
        <StudentCardEmptyState message="Chưa có dữ liệu." />
      </Card>
    </main>
  );
}
