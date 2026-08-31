"use client";

import { useMemo, useState } from "react";

import { getGeometryCenter } from "./map-geometry";
import { sortByAvailableScore } from "@/services/api/market-intelligence";
import type { HighSchoolItem, ProvinceFeatureCollection, ProvinceMetrics, RegionKey } from "./types";

interface HighSchoolMarkerLayerProps {
  activeRegion: RegionKey;
  geoData: ProvinceFeatureCollection;
  onSelectSchool: (provinceCode: string, schoolId: string) => void;
  projectPoint: (point: [number, number]) => [number, number];
  provinces: ProvinceMetrics[];
  selectedProvinceCode: string | null;
  selectedSchoolId: string | null;
}

interface SchoolMarker {
  point: [number, number];
  provinceCode: string;
  provinceName: string;
  school: ProvinceMetrics["highSchools"][number];
}

const MARKER_OFFSETS: Array<[number, number]> = [
  [0, 0],
  [6, 4],
  [-6, -4],
  [7, -5],
  [-7, 5],
  [0, 8],
];

const CLASSIFICATION_STYLE: Record<NonNullable<HighSchoolItem["classification"]>, { color: string; baseRadius: number; coreRadius: number; pulse: boolean }> = {
  "Trọng điểm": { color: "var(--success-500)", baseRadius: 9, coreRadius: 5.5, pulse: true },
  "Mở rộng": { color: "var(--primary-500)", baseRadius: 7, coreRadius: 4, pulse: false },
  "Duy trì": { color: "var(--warning-500)", baseRadius: 5.5, coreRadius: 3, pulse: false },
  "Sàng lọc": { color: "var(--text-tertiary)", baseRadius: 4.5, coreRadius: 2.25, pulse: false },
};

const UNCLASSIFIED_STYLE = { color: "var(--text-tertiary)", baseRadius: 4.5, coreRadius: 2.25, pulse: false };

export default function HighSchoolMarkerLayer({
  activeRegion,
  geoData,
  onSelectSchool,
  projectPoint,
  provinces,
  selectedProvinceCode,
  selectedSchoolId,
}: HighSchoolMarkerLayerProps) {
  const [hoveredSchoolId, setHoveredSchoolId] = useState<string | null>(null);

  const markers = useMemo<SchoolMarker[]>(() => {
    const featuresByCode = new Map(
      geoData.features.map((feature) => [feature.properties.code, feature]),
    );

    return provinces
      .filter((province) => activeRegion === "all" || province.regionKey === activeRegion)
      .flatMap((province) => {
        const feature = featuresByCode.get(province.code);
        if (!feature) return [];

        const schools = sortByAvailableScore(province.highSchools, "potentialScore");
        const visibleSchools =
          province.code === selectedProvinceCode ? schools : schools.slice(0, 2);

        const center = getGeometryCenter(feature.geometry.coordinates);
        const [centerX, centerY] = projectPoint(center);
        return visibleSchools.map((school, index) => {
          const [xOffset, yOffset] = MARKER_OFFSETS[index] ?? [0, 0];

          return {
            point: [centerX + xOffset, centerY + yOffset],
            provinceCode: province.code,
            provinceName: province.name,
            school,
          };
        });
      });
  }, [activeRegion, geoData, projectPoint, provinces, selectedProvinceCode]);

  return (
    <g aria-label="Các điểm trường THPT theo tiềm năng" className="high-school-layer">
      {markers.map(({ point, provinceCode, provinceName, school }) => {
        const [markerX, markerY] = point;
        const isSelected = selectedSchoolId === school.id;
        const isHovered = hoveredSchoolId === school.id;
        const isInSelectedProvince = selectedProvinceCode === provinceCode;
        const style = school.classification ? CLASSIFICATION_STYLE[school.classification] : UNCLASSIFIED_STYLE;
        const emphasis = isSelected || isHovered ? 1.35 : isInSelectedProvince ? 1.15 : 1;
        const haloRadius = style.baseRadius * emphasis;
        const coreRadius = style.coreRadius * emphasis;

        return (
          <g
            aria-label={`${school.name}, ${provinceName}: nhóm ${school.classification ?? "chưa phân loại"}, ${school.potentialScore ?? "chưa có"} điểm tiềm năng`}
            className="cursor-pointer outline-none focus:outline-none"
            key={school.id}
            onBlur={() => setHoveredSchoolId(null)}
            onClick={(event) => {
              event.stopPropagation();
              onSelectSchool(provinceCode, school.id);
            }}
            onFocus={() => setHoveredSchoolId(school.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelectSchool(provinceCode, school.id);
              }
            }}
            onMouseEnter={() => setHoveredSchoolId(school.id)}
            onMouseLeave={() => setHoveredSchoolId(null)}
            role="button"
            tabIndex={0}
          >
			<title>{school.name} · {school.classification ?? "Chưa phân loại"} · {school.potentialScore ?? "-"}{school.potentialScore === null ? "" : "/100"}</title>
            {style.pulse && (
              <circle cx={markerX} cy={markerY} fill={style.color} fillOpacity={0.3} r={haloRadius}>
                <animate attributeName="r" values={`${haloRadius};${haloRadius * 1.8};${haloRadius}`} dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="fill-opacity" values="0.3;0;0.3" dur="2.4s" repeatCount="indefinite" />
              </circle>
            )}
            <circle
              cx={markerX}
              cy={markerY}
              fill={style.color}
              fillOpacity={isSelected || isHovered ? 0.24 : 0.14}
              r={haloRadius}
            />
            <circle
              cx={markerX}
              cy={markerY}
              fill={style.color}
              r={coreRadius}
              stroke="var(--card-background)"
              strokeWidth={isSelected ? 2 : 1.5}
            />
          </g>
        );
      })}
    </g>
  );
}
