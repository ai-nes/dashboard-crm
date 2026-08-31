import { InfoTriangle } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { SchoolDirectoryRecord, SchoolIntelligenceData } from "@/services/api/schools/types";

import SchoolLocalityMap from "./school-locality-map-loader";
import { getSchoolLocalityContext, type LocalityCoordinate } from "./school-locality-data";

interface SchoolLocalityCardProps {
  school: SchoolDirectoryRecord;
  coordinates?: LocalityCoordinate;
  geography?: SchoolIntelligenceData["geography"];
  demographics?: SchoolIntelligenceData["demographics"];
}

export default function SchoolLocalityCard({ coordinates, demographics, geography, school }: SchoolLocalityCardProps) {
  const context = getSchoolLocalityContext(school, coordinates);
  const clusterLabel = geography ? getClusterLabel(geography.cluster) : "-";
  const relativeIncome = demographics?.relativeIncome ?? "-";
  const tuitionAffordability = demographics ? getAffordabilityLabel(demographics.tuitionAffordability) : "-";
  const parentInvolvement = demographics?.parentInvolvement ?? "-";

  return (
    <Card className="min-w-0 overflow-hidden p-0">
      <CardHeader className="items-start border-b border-card-border p-5 pb-4 lg:p-6 lg:pb-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Khoảng cách &amp; kế hoạch tiếp cận</CardTitle>
            <Badge color={context.isLongAn ? "primary" : "gray"}>{context.isLongAn ? "Long An · vệ tinh TP.HCM" : context.regionLabel}</Badge>
          </div>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-text-tertiary">Tính khoảng cách đến campus để chọn cách tiếp cận và hỗ trợ phù hợp.</p>
        </div>
        <span className="shrink-0 text-xs text-text-tertiary">Mock địa bàn · 2026</span>
      </CardHeader>

      <div className="grid min-w-0 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        <div className="flex h-full min-h-full min-w-0 flex-col p-5 lg:p-6 xl:border-r xl:border-card-border">
          <SchoolLocalityMap context={context} className="flex-1 xl:h-auto xl:min-h-[42rem]" />

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-text-secondary">
            <LegendDot color="bg-warning-500" label="Trường / nguồn học sinh" />
            <LegendDot color="bg-primary-500" label="FPTU TP.HCM" />
            <span className="text-text-tertiary">Nền bản đồ OpenStreetMap · tuyến đường OSRM</span>
          </div>
        </div>

        <aside className="min-w-0 border-t border-card-border p-5 lg:p-6 xl:border-t-0" aria-label={`Tóm tắt bối cảnh ${school.province}`}>
          <div className="rounded-2xl border border-primary-200 bg-badge-primary-background p-4">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-primary-500 uppercase">Tuyến tiếp cận</p>
            <h3 className="mt-2 text-2xl leading-8 font-semibold tracking-[-0.4px] text-text-primary">{context.routeLabel}</h3>
            <p className="mt-2 text-sm leading-5 text-text-secondary">Dùng khoảng cách để chọn kênh tư vấn và mức hỗ trợ.</p>

            <div className="mt-4 grid gap-1 border-t border-primary-200 pt-3">
              <Endpoint label="Từ" name={context.source.name} />
              <Endpoint label="Đến" name={context.campus.name} />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 divide-x divide-card-border rounded-xl bg-background-soft-50 py-3 text-center">
            <RouteMetric label="Khoảng cách" value={`~${context.distanceKm} km`} />
            <RouteMetric label="Thời gian" value={context.travelTime} />
            <RouteMetric label="Khu vực" value={clusterLabel} />
          </div>

          <div className="mt-5 rounded-xl border border-warning-200 bg-badge-warning-background p-4">
            <div className="flex items-start gap-2.5">
              <InfoTriangle size={17} className="mt-0.5 shrink-0 text-warning-500" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary">Rủi ro cần tính trước</p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-text-secondary">
                  {context.risks.map((risk) => <li key={risk}>{risk}</li>)}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-primary-200 bg-badge-primary-background p-4">
            <p className="text-sm font-semibold text-text-primary">Nên làm</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-text-secondary">
              {context.actions.map((action) => <li key={action}>{action}</li>)}
            </ul>
          </div>

          <div className="mt-5 border-t border-card-border pt-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-semibold text-text-primary">Quy mô khu vực</p>
              <span className="text-[11px] text-text-tertiary">Số liệu minh hoạ (mock)</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3">
              <ContextMetric label="Số trường lân cận" value={context.mockStats.schools} />
              <ContextMetric label="Học sinh lớp 12" value={context.mockStats.grade12Students} />
              <ContextMetric label="Tỷ lệ học ngoài tỉnh" value={context.mockStats.outOfProvinceRate} />
              <ContextMetric label="Tỷ lệ quan tâm Công nghệ" value={context.mockStats.fptInterestRate} />
            </div>
          </div>

          <dl className="mt-5 grid gap-x-5 gap-y-3 border-t border-card-border pt-4 sm:grid-cols-2">
            <DemographicItem label="Khu vực tuyển sinh" value={clusterLabel} />
            <DemographicItem label="Mức sống khu vực" value={relativeIncome} />
            <DemographicItem label="Khả năng đóng học phí" value={tuitionAffordability} />
            <DemographicItem label="Phụ huynh đồng hành" value={parentInvolvement} />
          </dl>
        </aside>
      </div>

      <p className="flex items-start gap-1.5 border-t border-card-border px-5 py-4 text-xs leading-5 text-text-tertiary lg:px-6">
        <InfoTriangle size={14} className="mt-0.5 shrink-0 text-warning-500" aria-hidden="true" />
        Số liệu địa bàn là mock để minh hoạ cách chọn kênh tiếp cận; cần thay bằng dữ liệu xác thực trước khi triển khai.
      </p>
    </Card>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-1.5"><span className={`size-2.5 rounded-full ${color}`} aria-hidden="true" />{label}</span>;
}

function RouteMetric({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 px-2"><p className="text-[11px] text-text-tertiary">{label}</p><p className="mt-1 truncate text-sm font-semibold text-text-primary" title={value}>{value}</p></div>;
}

function ContextMetric({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><p className="text-[11px] leading-4 text-text-tertiary">{label}</p><p className="mt-1 text-base font-semibold text-text-primary">{value}</p></div>;
}

function Endpoint({ label, name }: { label: string; name: string }) {
  return <div className="grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] items-center gap-2"><span className="text-xs font-medium text-text-tertiary">{label}</span><p className="min-w-0 truncate text-sm font-semibold text-text-primary" title={name}>{name}</p></div>;
}

function DemographicItem({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><dt className="text-[11px] text-text-tertiary">{label}</dt><dd className="mt-1 break-words text-sm font-medium text-text-primary">{value}</dd></div>;
}

function getClusterLabel(value: string) {
  return ({
    "Cụm đô thị dày": "Nhiều trường gần nhau",
    "Cụm huyện lỵ cũ": "Khu trung tâm cũ",
    "Trường lẻ vùng xa": "Trường xa campus",
  } as Record<string, string>)[value] ?? value;
}

function getAffordabilityLabel(value: string) {
  return value.includes("đầy đủ") ? "Có thể tự chi trả" : "Nên có học bổng / trả góp";
}
