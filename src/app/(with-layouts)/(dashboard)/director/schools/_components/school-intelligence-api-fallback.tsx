import { ArrowLeft, MapMarker5 } from "@tailgrids/icons";
import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";
import type { DataAvailabilityStatus, DirectorSchoolDetailData } from "@/services/api/schools/types";

import SchoolLocalityCard from "./school-locality-card";

interface SchoolIntelligenceApiFallbackProps {
  data?: DirectorSchoolDetailData;
  error?: string;
}

const unavailable = "-";

export default function SchoolIntelligenceApiFallback({ data, error }: SchoolIntelligenceApiFallbackProps) {
  if (!data) {
    return (
      <main className="px-2 py-4 lg:px-6">
        <div className="rounded-2xl border border-error-500/30 bg-card-background p-8 text-center" role="alert">
          <h1 className="text-lg font-semibold text-text-primary">Không thể tải chi tiết trường</h1>
          <p className="mt-2 text-sm text-text-secondary">{error ?? "Không có dữ liệu trường học."}</p>
          <Link className="mt-4 inline-block text-sm font-medium text-primary-500" href="/director/market-intelligence">
            Quay lại bản đồ
          </Link>
        </div>
      </main>
    );
  }

  const { school } = data;
  const coordinates = data.locality.latitude !== null && data.locality.longitude !== null
    ? [data.locality.latitude, data.locality.longitude] as [number, number]
    : undefined;
  const location = [school.ward, school.province].filter(Boolean).join(", ") || unavailable;

  return (
    <main className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6">
      <Link href="/director/market-intelligence" className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary">
        <ArrowLeft size={16} />
        Quay lại bản đồ địa bàn
      </Link>

      <section className="rounded-2xl border border-card-border bg-card-background p-5 lg:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap gap-2">
              {data.classification.isKeyAccount === true && <Badge color="success">Trường trọng điểm</Badge>}
              {school.isBoardingSchool === true && <Badge color="violet">Trường DTNT</Badge>}
              <AvailabilityBadge status={data.dataAvailability.status} />
            </div>
            <h1 className="text-2xl font-semibold text-text-primary lg:text-3xl">{school.name}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-text-secondary"><MapMarker5 size={16} />{location}</p>
            <p className="mt-1 text-xs text-text-tertiary">{school.address ?? unavailable} · Mã {school.schoolCode ?? unavailable}</p>
          </div>
          <div className="rounded-xl bg-background-soft-50 px-4 py-3 text-right">
            <p className="text-xs text-text-tertiary">Phân loại</p>
            <p className="mt-1 text-lg font-semibold text-text-primary">{data.classification.group ?? unavailable}</p>
            <p className="mt-1 text-xs text-text-secondary">{data.classification.label ?? unavailable}</p>
          </div>
        </div>
      </section>

      <section aria-label="Chỉ số trường" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Metric label="Điểm tiềm năng" value={formatPotentialScore(data.potentialScore)} />
        <Metric label="Học sinh lớp 12" value={formatNumber(data.grade12Students)} />
        <Metric label="Có thể tiếp cận" value={formatNumber(data.availableStudents)} />
        <Metric label="Prospect" value={formatNumber(data.prospects)} />
        <Metric label="Hồ sơ" value={formatNumber(data.applications)} />
        <Metric label="Nhập học" value={formatNumber(data.enrollment)} />
      </section>

      <SchoolLocalityCard coordinates={coordinates} school={toDirectorySchool(school)} />

      {data.asOf && <p className="text-right text-xs text-text-tertiary">Dữ liệu cập nhật: {data.asOf}</p>}
    </main>
  );
}

function AvailabilityBadge({ status }: { status?: DataAvailabilityStatus }) {
  if (!status) return null;
  const color = status === "available" ? "success" : status === "partial" ? "warning" : "gray";
  const label = status === "available" ? "Đủ dữ liệu" : status === "partial" ? "Dữ liệu một phần" : unavailable;
  return <Badge color={color}>{label}</Badge>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-card-border bg-card-background p-4"><p className="text-xs text-text-tertiary">{label}</p><p className="mt-2 text-xl font-semibold text-text-primary">{value}</p></div>;
}

function formatNumber(value: number | null, suffix = "") {
  return value === null || !Number.isFinite(value) ? unavailable : `${value.toLocaleString("vi-VN")}${suffix}`;
}

function formatPotentialScore(value: number | null) {
  return value === null || !Number.isFinite(value)
    ? "Chưa có dữ liệu"
    : `${value.toLocaleString("vi-VN")}/100`;
}

function toDirectorySchool(school: DirectorSchoolDetailData["school"]) {
  return {
    id: school.id,
    provinceCode: school.provinceCode ?? "",
    province: school.province ?? unavailable,
    districtCode: school.wardCode ?? "",
    district: school.ward ?? unavailable,
    schoolCode: school.schoolCode ?? unavailable,
    name: school.name,
    address: school.address ?? "",
    area: school.area ?? "",
    isBoardingSchool: school.isBoardingSchool ?? false,
  };
}
