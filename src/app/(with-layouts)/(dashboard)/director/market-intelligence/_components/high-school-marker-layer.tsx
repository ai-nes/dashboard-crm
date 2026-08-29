"use client";

import { useMemo, useState } from "react";

import { getGeometryCenter } from "./map-geometry";
import type { ProvinceFeatureCollection, ProvinceMetrics, RegionKey } from "./types";

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

function getPotentialColor(score: number) {
  if (score >= 88) return "var(--success-500)";
  if (score >= 78) return "var(--primary-500)";
  return "var(--warning-500)";
}

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

        const schools = [...province.highSchools].sort(
          (left, right) => right.potentialScore - left.potentialScore,
        );
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
        const markerColor = getPotentialColor(school.potentialScore);

        return (
          <g
            aria-label={`${school.name}, ${provinceName}: ${school.potentialScore} điểm tiềm năng`}
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
            <title>{school.name} · Potential {school.potentialScore}/100</title>
            <circle
              cx={markerX}
              cy={markerY}
              fill={markerColor}
              fillOpacity={isSelected || isHovered ? 0.24 : 0.14}
              r={isSelected || isHovered ? 10 : isInSelectedProvince ? 7 : 5}
            />
            <circle
              cx={markerX}
              cy={markerY}
              fill={markerColor}
              r={isSelected || isHovered ? 4.5 : isInSelectedProvince ? 3.5 : 2.75}
              stroke="var(--card-background)"
              strokeWidth={isSelected ? 2 : 1.5}
            />

          </g>
        );
      })}
    </g>
  );
}
