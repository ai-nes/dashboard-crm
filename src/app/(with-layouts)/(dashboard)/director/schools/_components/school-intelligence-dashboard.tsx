import { ArrowLeft, MapMarker5 } from "@tailgrids/icons";
import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import type { DataAvailabilityStatus, DirectorSchoolDetailData } from "@/services/api/schools/types";

interface Props { data?: DirectorSchoolDetailData; error?: string }

const unavailable = "Chưa có dữ liệu";

export default function SchoolIntelligenceDashboard({ data, error }: Props) {
  if (!data) return <SchoolError message={error ?? "Không có dữ liệu trường học."} />;
  const { school, relationship, classification } = data;
  const location = [school.ward, school.province].filter(Boolean).join(", ") || unavailable;

  return (
    <main className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6">
      <header>
        <Link href="/director/market-intelligence" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary"><ArrowLeft size={16} />Quay lại bản đồ địa bàn</Link>
        <div className="rounded-2xl border border-card-border bg-card-background p-5 lg:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap gap-2">
                {classification.isKeyAccount === true && <Badge color="success">Trường trọng điểm</Badge>}
                {school.isBoardingSchool === true && <Badge color="violet">Trường DTNT</Badge>}
                <AvailabilityBadge status={data.dataAvailability.status} />
              </div>
              <h1 className="text-2xl font-semibold text-text-primary lg:text-3xl">{school.name}</h1>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-text-secondary"><MapMarker5 size={16} />{location}</p>
              <p className="mt-1 text-xs text-text-tertiary">{school.address ?? unavailable} · Mã {school.schoolCode ?? unavailable}</p>
            </div>
            <div className="rounded-xl bg-background-soft-50 px-4 py-3 text-right">
              <p className="text-xs text-text-tertiary">Phân loại</p>
              <p className="mt-1 text-lg font-semibold text-text-primary">{classification.group ?? unavailable}</p>
              <p className="mt-1 text-xs text-text-secondary">{classification.label ?? unavailable}</p>
            </div>
          </div>
        </div>
      </header>

      <section aria-label="Chỉ số trường" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Metric label="Điểm tiềm năng" value={formatNumber(data.potentialScore, "/100")} />
        <Metric label="Học sinh lớp 12" value={formatNumber(data.grade12Students)} />
        <Metric label="Có thể tiếp cận" value={formatNumber(data.availableStudents)} />
        <Metric label="Prospect" value={formatNumber(data.prospects)} />
        <Metric label="Hồ sơ" value={formatNumber(data.applications)} />
        <Metric label="Nhập học" value={formatNumber(data.enrollment)} />
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <Section title="Quan hệ với trường" status={sectionStatus(data, "relationship")}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Fact label="Mức độ" value={relationship.level} />
            <Fact label="Điểm quan hệ" value={formatNumber(relationship.score, "/100")} />
            <Fact label="Đầu mối" value={relationship.contact} />
            <Fact label="Vai trò" value={relationship.contactRole} />
            <Fact label="Lần chạm gần nhất" value={relationship.lastTouch} />
            <Fact label="Lần chạm tiếp theo" value={relationship.nextTouch} />
          </div>
          {data.contacts.length ? <ul className="mt-4 divide-y divide-card-border">{data.contacts.map((contact, index) => <li className="py-3" key={`${contact.role}-${contact.fullName}-${index}`}><p className="text-sm font-medium text-text-primary">{contact.fullName ?? unavailable}</p><p className="mt-1 text-xs text-text-secondary">{[contact.role, contact.position, contact.relationshipStatus].filter(Boolean).join(" · ") || unavailable}</p><p className="mt-1 text-xs text-text-tertiary">Lần chạm: {contact.lastTouch ?? unavailable} · Tiếp theo: {contact.nextTouch ?? unavailable}</p></li>)}</ul> : <Empty />}
        </Section>

        <Section title="Hoạt động" status={sectionStatus(data, "activities")}>
          {data.activities.length ? <ul className="divide-y divide-card-border">{data.activities.map((activity, index) => <li className="py-3 first:pt-0" key={`${activity.activityType}-${activity.occurredAt}-${index}`}><div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-text-primary">{activity.activityType ?? unavailable}</p><Badge color={activity.status === "completed" ? "success" : "primary"}>{activity.status ?? unavailable}</Badge></div><p className="mt-1 text-xs text-text-secondary">{activity.scheduledAt ?? activity.occurredAt ?? unavailable}</p><p className="mt-1 text-xs text-text-tertiary">Kết quả: {activity.outcome ?? unavailable} · Tham dự: {formatNumber(activity.attendance)}</p></li>)}</ul> : <Empty />}
        </Section>
      </div>

      <Section title="Địa điểm" status={sectionStatus(data, "locality")}>
        {data.locality.latitude !== null && data.locality.longitude !== null
          ? <p className="text-sm text-text-secondary">Tọa độ xác thực: {data.locality.latitude}, {data.locality.longitude}</p>
          : <Empty />}
      </Section>

      <div className="grid gap-5 md:grid-cols-3">
        <UnavailableSection title="Hồ sơ học thuật" />
        <UnavailableSection title="Nhân khẩu học" />
        <UnavailableSection title="Kết quả sau tốt nghiệp" />
      </div>
      {data.asOf && <p className="text-right text-xs text-text-tertiary">Dữ liệu cập nhật: {data.asOf}</p>}
    </main>
  );
}

function sectionStatus(data: DirectorSchoolDetailData, key: string) {
  return data.dataAvailability.sections[key] ?? "unavailable";
}

function AvailabilityBadge({ status }: { status?: DataAvailabilityStatus }) {
  if (!status) return null;
  const color = status === "available" ? "success" : status === "partial" ? "warning" : "gray";
  const label = status === "available" ? "Đủ dữ liệu" : status === "partial" ? "Dữ liệu một phần" : unavailable;
  return <Badge color={color}>{label}</Badge>;
}

function Section({ title, status, children }: { title: string; status: DataAvailabilityStatus; children: ReactNode }) {
  return <section className="rounded-2xl border border-card-border bg-card-background p-5"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-base font-semibold text-text-primary">{title}</h2><AvailabilityBadge status={status} /></div>{children}</section>;
}

function UnavailableSection({ title }: { title: string }) {
  return <Section title={title} status="unavailable"><Empty /></Section>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-card-border bg-card-background p-4"><p className="text-xs text-text-tertiary">{label}</p><p className="mt-2 text-xl font-semibold text-text-primary">{value}</p></div>;
}

function Fact({ label, value }: { label: string; value: string | null }) {
  return <div className="rounded-xl bg-background-soft-50 p-3"><p className="text-xs text-text-tertiary">{label}</p><p className="mt-1 text-sm font-medium text-text-primary">{value ?? unavailable}</p></div>;
}

function Empty() { return <p className="text-sm text-text-tertiary">{unavailable}</p>; }
function formatNumber(value: number | null, suffix = "") { return value === null ? unavailable : `${value.toLocaleString("vi-VN")}${suffix}`; }
function SchoolError({ message }: { message: string }) { return <main className="px-2 py-4 lg:px-6"><div className="rounded-2xl border border-error-500/30 bg-card-background p-8 text-center" role="alert"><h1 className="text-lg font-semibold text-text-primary">Không thể tải chi tiết trường</h1><p className="mt-2 text-sm text-text-secondary">{message}</p><Link className="mt-4 inline-block text-sm font-medium text-primary-500" href="/director/market-intelligence">Quay lại bản đồ</Link></div></main>; }
