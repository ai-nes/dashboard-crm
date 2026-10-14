"use client";

import { useMemo, useState } from "react";

import { sortByAvailableScore } from "@/services/api/market-intelligence";
import { SCHOOL_CLASSIFICATION_VISUALS } from "./school-classification-visuals";
import type { LocatedSchoolMapEntry } from "./school-map-coverage";

const UNCLASSIFIED_MARKER_VISUAL = {
  markerColor: "var(--icon-tertiary)",
  markerRadius: SCHOOL_CLASSIFICATION_VISUALS["Trọng điểm"].markerRadius / 2,
  markerCoreRadius:
    SCHOOL_CLASSIFICATION_VISUALS["Trọng điểm"].markerCoreRadius / 2,
};

interface HighSchoolMarkerLayerProps {
  onSelectSchool: (provinceCode: string, schoolId: string) => void;
  projectPoint: (point: [number, number]) => [number, number];
  schools: LocatedSchoolMapEntry[];
  selectedProvinceCode: string | null;
  selectedSchoolId: string | null;
}

interface SchoolMarker {
  point: [number, number];
  provinceCode: LocatedSchoolMapEntry["provinceCode"];
  provinceName: LocatedSchoolMapEntry["provinceName"];
  school: LocatedSchoolMapEntry["school"];
}

export default function HighSchoolMarkerLayer({
  onSelectSchool,
  projectPoint,
  schools,
  selectedProvinceCode,
  selectedSchoolId,
}: HighSchoolMarkerLayerProps) {
  const [hoveredSchoolId, setHoveredSchoolId] = useState<string | null>(null);

  const markers = useMemo<SchoolMarker[]>(() => {
    return sortByAvailableScore(
      schools.map((entry) => ({
        ...entry,
        potentialScore: entry.school.potentialScore,
      })),
      "potentialScore",
    ).map(({ coordinates, provinceCode, provinceName, school }) => ({
      point: projectPoint(coordinates),
      provinceCode,
      provinceName,
      school,
    }));
  }, [projectPoint, schools]);

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
        const classification = school.classification;
        const canOpenDetails = Boolean(school.directoryId);
        const classificationLabel = classification ?? "Chưa phân loại";
        const style = classification
          ? SCHOOL_CLASSIFICATION_VISUALS[classification]
          : UNCLASSIFIED_MARKER_VISUAL;
        const emphasis =
          isSelected || isHovered ? 1.2 : isInSelectedProvince ? 1.08 : 1;
        const haloRadius = style.markerRadius * emphasis;
        const coreRadius = style.markerCoreRadius * emphasis;
        const hitRadius = Math.max(7, haloRadius * 1.4);

        return (
          <g
            aria-disabled={!canOpenDetails}
            aria-label={`${school.name}, ${provinceName}: ${classificationLabel}, ${school.potentialScore ?? "chưa có"} điểm tiềm năng${canOpenDetails ? "" : ", không thể mở chi tiết: thiếu mã tra cứu trường"}`}
            className={`${canOpenDetails ? "cursor-pointer" : "cursor-default"} outline-none focus:outline-none`}
            key={school.id}
            onBlur={() => setHoveredSchoolId(null)}
            onClick={(event) => {
              event.stopPropagation();
              if (school.directoryId) onSelectSchool(provinceCode, school.id);
            }}
            onFocus={() => setHoveredSchoolId(school.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                if (school.directoryId) onSelectSchool(provinceCode, school.id);
              }
            }}
            onMouseEnter={() => setHoveredSchoolId(school.id)}
            onMouseLeave={() => setHoveredSchoolId(null)}
            role="button"
            tabIndex={canOpenDetails ? 0 : -1}
          >
            <title>
              {`${school.name} · ${classificationLabel} · ${school.potentialScore ?? "-"}${school.potentialScore === null ? "" : "/100"}${canOpenDetails ? "" : " · Không thể mở chi tiết: thiếu mã tra cứu trường"}`}
            </title>
            <circle
              cx={markerX}
              cy={markerY}
              fill="transparent"
              r={hitRadius}
            />
            {classification === "Trọng điểm" && (
              <circle
                cx={markerX}
                cy={markerY}
                fill={style.markerColor}
                fillOpacity={0.34}
                r={haloRadius}
              >
                <animate
                  attributeName="r"
                  values={`${haloRadius};${haloRadius * 1.45};${haloRadius}`}
                  dur="2.4s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="fill-opacity"
                  values="0.34;0;0.34"
                  dur="2.4s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
            <circle
              cx={markerX}
              cy={markerY}
              fill={style.markerColor}
              fillOpacity={isSelected || isHovered ? 0.36 : 0.26}
              r={haloRadius}
            />
            {classification === null ? (
              <circle
                cx={markerX}
                cy={markerY}
                fill="var(--card-background)"
                r={coreRadius}
                stroke="var(--icon-tertiary)"
                strokeWidth={isSelected ? 1 : 0.75}
              />
            ) : (
              <circle
                cx={markerX}
                cy={markerY}
                fill={style.markerColor}
                r={coreRadius}
                stroke="var(--card-background)"
                strokeWidth={isSelected ? 0.5 : 0.25}
              />
            )}
          </g>
        );
      })}
    </g>
  );
}
