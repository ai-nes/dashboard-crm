import { InfoTriangle } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type {
  DirectorSchoolLocality,
  SchoolDirectoryRecord,
  SchoolIntelligenceData,
} from "@/services/api/schools/types";

import {
  getSchoolLocalityContext,
  type LocalityCoordinate,
} from "./school-locality-data";

interface SchoolLocalityCardProps {
  school: SchoolDirectoryRecord;
  coordinates?: LocalityCoordinate;
  locality?: DirectorSchoolLocality;
  geography?: SchoolIntelligenceData["geography"];
  demographics?: SchoolIntelligenceData["demographics"];
}

export default function SchoolLocalityCard({
  coordinates,
  demographics,
  geography,
  locality,
  school,
}: SchoolLocalityCardProps) {
  const context = getSchoolLocalityContext(school, coordinates, locality);
  const hasLocalityStats = context.mockStats.schools !== "-";
  const clusterLabel = geography ? getClusterLabel(geography.cluster) : "-";
  const relativeIncome = demographics?.relativeIncome ?? "-";
  const tuitionAffordability = demographics
    ? getAffordabilityLabel(demographics.tuitionAffordability)
    : "-";
  const parentInvolvement = demographics?.parentInvolvement ?? "-";

  return (
    <Card className="min-w-0 overflow-hidden p-0">
      <CardHeader className="items-start border-b border-card-border p-5 pb-4 lg:p-6 lg:pb-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Khoảng cách &amp; kế hoạch tiếp cận</CardTitle>
            <Badge color={context.isLongAn ? "primary" : "gray"}>
              {context.isLongAn
                ? "Long An · vệ tinh TP.HCM"
                : context.regionLabel}
            </Badge>
          </div>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-text-tertiary">
            Tính khoảng cách đến campus để chọn cách tiếp cận và hỗ trợ phù hợp.
          </p>
        </div>
      </CardHeader>

      <div className="min-w-0 p-5 lg:p-6">
        <section
          className="min-w-0"
          aria-label={`Tóm tắt bối cảnh ${school.province}`}
        >
          <div className="rounded-2xl border border-primary-200 bg-badge-primary-background p-4">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-primary-500 uppercase">
              Tuyến tiếp cận
            </p>
            <h3 className="mt-2 text-2xl leading-8 font-semibold tracking-[-0.4px] text-text-primary">
              {context.routeLabel}
            </h3>
            <p className="mt-2 text-sm leading-5 text-text-secondary">
              Dùng khoảng cách để chọn kênh tư vấn và mức hỗ trợ.
            </p>

            <div className="mt-4 grid gap-1 border-t border-primary-200 pt-3">
              <Endpoint label="Từ" name={context.source.name} />
              <Endpoint label="Đến" name={context.campus.name} />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 divide-x divide-card-border rounded-xl bg-background-soft-50 py-3 text-center">
            <RouteMetric
              label="Khoảng cách"
              value={`~${context.distanceKm} km`}
            />
            <RouteMetric label="Thời gian" value={context.travelTime} />
            <RouteMetric label="Khu vực" value={clusterLabel} />
          </div>

          <div className="mt-5 rounded-xl border border-warning-200 bg-badge-warning-background p-4">
            <div className="flex items-start gap-2.5">
              <InfoTriangle
                size={17}
                className="mt-0.5 shrink-0 text-warning-500"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary">
                  Rủi ro cần tính trước
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-text-secondary">
                  {context.risks.map((risk) => (
                    <li key={risk}>{risk}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-primary-200 bg-badge-primary-background p-4">
            <p className="text-sm font-semibold text-text-primary">Nên làm</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-text-secondary">
              {context.actions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </div>

          <div className="mt-5 border-t border-card-border pt-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-semibold text-text-primary">
                Quy mô khu vực
              </p>
              <span className="text-[11px] text-text-tertiary">
                {hasLocalityStats ? "Theo dữ liệu hệ thống" : "Chưa có dữ liệu"}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3">
              <ContextMetric
                label="Số trường lân cận"
                value={context.mockStats.schools}
              />
              <ContextMetric
                label="Học sinh lớp 12"
                value={context.mockStats.grade12Students}
              />
              <ContextMetric
                label="Tỷ lệ học ngoài tỉnh"
                value={context.mockStats.outOfProvinceRate}
              />
              <ContextMetric
                label="Tỷ lệ quan tâm Công nghệ"
                value={context.mockStats.fptInterestRate}
              />
            </div>
          </div>

          <dl className="mt-5 grid gap-x-5 gap-y-3 border-t border-card-border pt-4 sm:grid-cols-2">
            <DemographicItem label="Khu vực tuyển sinh" value={clusterLabel} />
            <DemographicItem label="Mức sống khu vực" value={relativeIncome} />
            <DemographicItem
              label="Khả năng đóng học phí"
              value={tuitionAffordability}
            />
            <DemographicItem
              label="Phụ huynh đồng hành"
              value={parentInvolvement}
            />
          </dl>
        </section>
      </div>

      {!hasLocalityStats && (
        <p className="flex items-start gap-1.5 border-t border-card-border px-5 py-4 text-xs leading-5 text-text-tertiary lg:px-6">
          <InfoTriangle
            size={14}
            className="mt-0.5 shrink-0 text-warning-500"
            aria-hidden="true"
          />
          Chưa có dữ liệu quy mô khu vực xác thực cho địa bàn này.
        </p>
      )}
    </Card>
  );
}

function RouteMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 px-2">
      <p className="text-[11px] text-text-tertiary">{label}</p>
      <p
        className="mt-1 truncate text-sm font-semibold text-text-primary"
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

function ContextMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] leading-4 text-text-tertiary">{label}</p>
      <p className="mt-1 text-base font-semibold text-text-primary">{value}</p>
    </div>
  );
}

function Endpoint({ label, name }: { label: string; name: string }) {
  return (
    <div className="grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] items-center gap-2">
      <span className="text-xs font-medium text-text-tertiary">{label}</span>
      <p
        className="min-w-0 truncate text-sm font-semibold text-text-primary"
        title={name}
      >
        {name}
      </p>
    </div>
  );
}

function DemographicItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] text-text-tertiary">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-text-primary">
        {value}
      </dd>
    </div>
  );
}

function getClusterLabel(value: string) {
  return (
    (
      {
        "Cụm đô thị dày": "Nhiều trường gần nhau",
        "Cụm huyện lỵ cũ": "Khu trung tâm cũ",
        "Trường lẻ vùng xa": "Trường xa campus",
      } as Record<string, string>
    )[value] ?? value
  );
}

function getAffordabilityLabel(value: string) {
  return value.includes("đầy đủ")
    ? "Có thể tự chi trả"
    : "Nên có học bổng / trả góp";
}
