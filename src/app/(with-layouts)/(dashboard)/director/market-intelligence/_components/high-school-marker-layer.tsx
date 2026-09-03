"use client";

import { useMemo, useState } from "react";

import {
  getDistributedGeometryPoints,
  getGeometryCenter,
} from "./map-geometry";
import { sortByAvailableScore } from "@/services/api/market-intelligence";
import { SCHOOL_CLASSIFICATION_VISUALS } from "./school-classification-visuals";
import type {
  ProvinceFeatureCollection,
  ProvinceMetrics,
  RegionKey,
} from "./types";

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
      .filter(
        (province) =>
          activeRegion === "all" || province.regionKey === activeRegion,
      )
      .flatMap((province) => {
        const feature = featuresByCode.get(province.code);
        if (!feature) return [];

        const schools = sortByAvailableScore(
          province.highSchools,
          "potentialScore",
        );
        const distributedPoints = getDistributedGeometryPoints(
          feature.geometry.coordinates,
          schools.length,
        );

        const center = getGeometryCenter(feature.geometry.coordinates);
        const [centerX, centerY] = projectPoint(center);
        return schools.map((school, index) => {
          const [xOffset, yOffset] = MARKER_OFFSETS[index] ?? [0, 0];
          const point: [number, number] = school.coordinates
            ? projectPoint([
                school.coordinates.longitude,
                school.coordinates.latitude,
              ])
            : distributedPoints[index]
              ? projectPoint(distributedPoints[index])
              : [centerX + xOffset, centerY + yOffset];

          return {
            point,
            provinceCode: province.code,
            provinceName: province.name,
            school,
          };
        });
      });
  }, [activeRegion, geoData, projectPoint, provinces]);

  return (
    <g
      aria-label="Các điểm trường THPT theo tiềm năng"
      className="high-school-layer"
    >
      {markers.map(({ point, provinceCode, provinceName, school }) => {
        const [markerX, markerY] = point;
        const isSelected = selectedSchoolId === school.id;
        const isHovered = hoveredSchoolId === school.id;
        const isInSelectedProvince = selectedProvinceCode === provinceCode;
        const classification = school.classification ?? "Sàng lọc";
        const style = SCHOOL_CLASSIFICATION_VISUALS[classification];
        const emphasis =
          isSelected || isHovered ? 1.35 : isInSelectedProvince ? 1.15 : 1;
        const haloRadius = style.markerRadius * emphasis;
        const coreRadius = style.markerCoreRadius * emphasis;

        return (
          <g
            aria-label={`${school.name}, ${provinceName}: ${classification}, ${school.potentialScore ?? "chưa có"} điểm tiềm năng`}
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
            <title>
              {school.name} · {classification} ·{" "}
              {school.potentialScore ?? "-"}
              {school.potentialScore === null ? "" : "/100"}
            </title>
            {classification === "Trọng điểm" && (
              <circle
                cx={markerX}
                cy={markerY}
                fill={style.markerColor}
                fillOpacity={0.3}
                r={haloRadius}
              >
                <animate
                  attributeName="r"
                  values={`${haloRadius};${haloRadius * 1.8};${haloRadius}`}
                  dur="2.4s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="fill-opacity"
                  values="0.3;0;0.3"
                  dur="2.4s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
            <circle
              cx={markerX}
              cy={markerY}
              fill={style.markerColor}
              fillOpacity={isSelected || isHovered ? 0.24 : 0.14}
              r={haloRadius}
            />
            <circle
              cx={markerX}
              cy={markerY}
              fill={style.markerColor}
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
