import { ArrowLeft, MapMarker5 } from "@tailgrids/icons";
import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";
import type {
  SchoolIntelligenceData,
} from "@/services/api/schools/types";

import { getSchoolLocalityContext } from "./school-locality-data";
import SchoolTerritoryMetrics from "./school-territory-metrics";

interface SchoolHeaderProps {
  data: SchoolIntelligenceData;
}

export default function SchoolHeader({ data }: SchoolHeaderProps) {
  const { school, classification, geography } = data;
  const coordinates =
    data.locality?.latitude != null && data.locality?.longitude != null
      ? ([data.locality.latitude, data.locality.longitude] as [number, number])
      : undefined;
  const locality = getSchoolLocalityContext(school, coordinates, data.locality);

  return (
    <header className="min-w-0 shrink-0">
      <Link
        href="/director/market-intelligence"
        className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-button-primary-focus-ring"
      >
        <ArrowLeft size={16} />
        Quay lại bản đồ địa bàn
      </Link>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-card-border bg-card-background">
        <div className="min-w-0 p-3 lg:p-4">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
            <div
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-badge-primary-background text-sm font-semibold text-badge-primary-text"
              aria-hidden="true"
            >
              {school.name
                .replace(/^THPT\s+/i, "")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <h1 className="min-w-0 text-balance text-xl font-semibold tracking-[-0.4px] text-text-primary lg:text-2xl lg:leading-8">
              {school.name}
            </h1>
            <Badge
              color={
                classification.group === "Trọng điểm"
                  ? "success"
                  : classification.group === "Mở rộng"
                    ? "primary"
                    : classification.group === "Duy trì"
                      ? "warning"
                      : "gray"
              }
            >
              {classification.group}
            </Badge>
            {school.isBoardingSchool && (
              <Badge color="violet">Trường DTNT</Badge>
            )}
            <span className="text-xs text-text-tertiary">
              Mã {school.schoolCode}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs leading-5 text-text-secondary">
            <MapMarker5 size={14} className="shrink-0 text-icon-tertiary" />
            <span>
              {school.district}, {school.province} · {geography.cluster}
            </span>
            <span className="hidden text-text-tertiary xl:inline">
              · {school.address}
            </span>
          </p>

          <SchoolTerritoryMetrics data={data} locality={locality} />
        </div>
      </div>
    </header>
  );
}
