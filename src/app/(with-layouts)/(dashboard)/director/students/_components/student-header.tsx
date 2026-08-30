"use client";

import { ArrowLeft, Envelope1, MapMarker5, Phone } from "@tailgrids/icons";
import Link from "next/link";
import { toast } from "sonner";

import { Avatar, AvatarBadge, AvatarFallback } from "@/components/tailgrids/core/avatar";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";

import type { Student360SectionProps } from "./types";

export default function StudentHeader({ data }: Student360SectionProps) {
  const { student } = data;
  const currentStep = data.journey.find((event) => event.status === "current");

  return (
    <header className="overflow-hidden rounded-2xl border border-card-border bg-card-background">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-card-border bg-card-background px-5 py-3 lg:px-6">
        <Link href="/director/students" className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary outline-none hover:text-primary-500 focus-visible:ring-4 focus-visible:ring-button-outline-focus-ring"><ArrowLeft size={16} />Danh sách học sinh</Link>
        <div className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-success-500" aria-hidden="true" /><span className="text-xs text-text-tertiary">Cập nhật 4 phút trước</span><Badge color="primary">Hồ sơ mô phỏng</Badge></div>
      </div>

      <div className="grid min-w-0 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.55fr)]">
        <div className="min-w-0 p-5 lg:p-6">
          <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start">
            <Avatar size="xxl"><AvatarFallback>{student.initials}</AvatarFallback><AvatarBadge size="xxl" status="online" /></Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-semibold tracking-[0.14em] text-brand-500 uppercase">Hồ sơ 360° · đang tư vấn</span><Badge color="success">Ưu tiên cao</Badge></div>
              <h1 className="mt-2 text-balance text-[32px] leading-9 font-semibold tracking-[-0.8px] text-text-primary">{student.name}</h1>
              <p className="mt-1 text-sm text-text-tertiary">{student.code} · {student.grade} · Quan tâm {student.major}</p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-secondary">
                <span className="flex items-center gap-1.5"><Phone size={15} className="text-icon-tertiary" aria-hidden="true" />{student.phone}</span>
                <span className="flex items-center gap-1.5"><Envelope1 size={15} className="text-icon-tertiary" aria-hidden="true" />{student.email}</span>
                <span className="flex items-center gap-1.5"><MapMarker5 size={15} className="text-icon-tertiary" aria-hidden="true" />{student.school}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <HeaderFact label="Phụ trách hồ sơ" value={student.counselor} tone="neutral" />
            <HeaderFact label="Rào cản chính" value={data.insight.concern} tone="warning" />
            <HeaderFact label="Bước tiếp theo" value={currentStep?.title ?? "Chưa xác định"} tone="primary" />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button size="sm" onPress={() => toast.success(`Đã tạo cuộc gọi tư vấn cho ${student.name}.`)}><Phone size={16} aria-hidden="true" />Gọi tư vấn</Button>
            <Button size="sm" appearance="outline" onPress={() => toast.success("Đã chuẩn bị phương án học phí và học bổng.")}><Envelope1 size={16} aria-hidden="true" />Gửi phương án học phí</Button>
          </div>
        </div>

        <aside className="border-t border-card-border bg-badge-success-background p-5 xl:border-t-0 xl:border-l xl:p-6" aria-label="Tóm tắt cơ hội nhập học">
          <div className="flex items-start justify-between gap-3"><p className="text-sm font-medium text-text-secondary">Khả năng nhập học hiện tại</p><Badge color="success">Ý định cao</Badge></div>
          <div className="mt-5 flex items-end justify-between gap-4"><strong className="text-5xl leading-none font-semibold tracking-[-1.5px] text-text-primary">{data.insight.probability}%</strong><span className="text-right text-sm font-semibold text-success-500">+{data.insight.scoreDelta ?? 0} điểm<br /><span className="font-normal text-text-tertiary">trong 7 ngày</span></span></div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-card-background"><div className="h-full rounded-full bg-success-500" style={{ width: `${data.insight.probability}%` }} /></div>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-success-500/20 pt-4 text-sm">
            <div><p className="text-xs text-text-tertiary">Độ tin cậy</p><p className="mt-1 font-semibold text-text-primary">{data.insight.confidence ?? 76}%</p></div>
            <div><p className="text-xs text-text-tertiary">Hạn hồ sơ</p><p className="mt-1 font-semibold text-warning-500">Còn 12 ngày</p></div>
          </div>
        </aside>
      </div>
    </header>
  );
}

function HeaderFact({ label, value, tone }: { label: string; value: string; tone: "neutral" | "warning" | "primary" }) {
  const toneClass = tone === "warning" ? "border-warning-500/30 bg-badge-warning-background" : tone === "primary" ? "border-primary-200 bg-badge-primary-background" : "border-card-border bg-card-background";
  return <div className={`min-w-0 rounded-xl border p-3 ${toneClass}`}><p className="text-[11px] text-text-tertiary">{label}</p><p className="mt-1 truncate text-sm font-semibold text-text-primary" title={value}>{value}</p></div>;
}
