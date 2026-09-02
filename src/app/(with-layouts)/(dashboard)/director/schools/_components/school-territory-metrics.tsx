import {
  ClockThree,
  MapMarker5,
  TrendUp2,
  UserMultiple1,
} from "@tailgrids/icons";

import type { SchoolIntelligenceData } from "@/services/api/schools/types";

import type { SchoolLocalityContext } from "./school-locality-data";

interface SchoolTerritoryMetricsProps {
  data: SchoolIntelligenceData;
  locality: SchoolLocalityContext;
}

const metrics = [
  {
    icon: MapMarker5,
    iconClassName: "bg-primary-50 text-primary-500",
    label: "Khoảng cách",
  },
  {
    icon: ClockThree,
    iconClassName: "bg-warning-50 text-warning-500",
    label: "Di chuyển",
  },
  {
    icon: UserMultiple1,
    iconClassName: "bg-success-50 text-success-500",
    label: "Quy mô lớp 12",
  },
  {
    icon: TrendUp2,
    iconClassName: "bg-primary-50 text-primary-500",
    label: "Ngoài tỉnh",
  },
] as const;

export default function SchoolTerritoryMetrics({
  data,
  locality,
}: SchoolTerritoryMetricsProps) {
  const values = [
    {
      value: `~${locality.distanceKm} km`,
      detail: data.geography.distanceTier,
    },
    {
      value: locality.travelTime,
      detail: "Tuyến tư vấn & campus tour",
    },
    {
      value: locality.mockStats.grade12Students,
      detail: `${locality.mockStats.schools} trường lân cận`,
    },
    {
      value: locality.mockStats.outOfProvinceRate,
      detail: "Tệp có thể đi học xa",
    },
  ];

  return (
    <section
      aria-label="Chỉ số địa bàn"
      className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4"
    >
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const value = values[index];
        return (
          <div
            key={metric.label}
            className="flex min-w-0 items-start gap-2.5 rounded-xl bg-background-soft-50 p-3"
          >
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${metric.iconClassName}`}
            >
              <Icon size={15} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] text-text-tertiary">{metric.label}</p>
              <p
                className="mt-0.5 truncate text-sm font-semibold text-text-primary"
                title={value.value}
              >
                {value.value}
              </p>
              <p
                className="mt-0.5 truncate text-[11px] text-text-secondary"
                title={value.detail}
              >
                {value.detail}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
