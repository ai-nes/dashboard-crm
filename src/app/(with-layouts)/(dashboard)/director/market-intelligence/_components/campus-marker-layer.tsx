"use client";

import { useState } from "react";
import { FPTU_CAMPUS_LOCATIONS } from "./data";
import type { FptuCampusLocation } from "./types";

interface CampusMarkerLayerProps {
  projectPoint: (point: [number, number]) => [number, number];
  onSelectCampus?: (campus: FptuCampusLocation) => void;
}

export default function CampusMarkerLayer({
  projectPoint,
  onSelectCampus,
}: CampusMarkerLayerProps) {
  const [activeCampus, setActiveCampus] = useState<FptuCampusLocation | null>(null);

  return (
    <g className="campus-layer" id="fptu-campuses">
      {FPTU_CAMPUS_LOCATIONS.map((campus) => {
        const [x, y] = projectPoint([campus.coordinates[1], campus.coordinates[0]]);
        const isHovered = activeCampus?.id === campus.id;
        const hasEnrollmentData = campus.target > 0;
        const fillPercentage = hasEnrollmentData
          ? Math.round((campus.currentEnrolled / campus.target) * 100)
          : 0;

        return (
          <g
            className="cursor-pointer transition-transform duration-200"
            key={campus.id}
            onClick={() => onSelectCampus?.(campus)}
            onMouseEnter={() => setActiveCampus(campus)}
            onMouseLeave={() => setActiveCampus(null)}
          >
            {/* Ambient Aura */}
            <circle
              cx={x}
              cy={y}
              fill="var(--color-brand-500, #3b82f6)"
              fillOpacity={0.25}
              r={isHovered ? 14 : 9}
            />

            {/* Inner Core */}
            <circle
              cx={x}
              cy={y}
              fill="var(--color-brand-500, #3b82f6)"
              r={isHovered ? 6.5 : 5}
              stroke="var(--color-card-background, #ffffff)"
              strokeWidth={2}
            />

            {/* Campus Label Pill (Supports both Light and Dark modes seamlessly) */}
            <g transform={`translate(${x}, ${y - 12})`}>
              <rect
                fill="var(--color-card-background, #1e293b)"
                fillOpacity={0.96}
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
                height={17}
                rx={4}
                stroke="var(--color-brand-500, #3b82f6)"
                strokeOpacity={0.5}
                strokeWidth={1}
                width={campus.shortName.length * 7 + 18}
                x={-(campus.shortName.length * 7 + 18) / 2}
                y={-14}
              />
              <text
                dominantBaseline="middle"
                fill="var(--color-text-primary, #0f172a)"
                fontSize={9}
                fontWeight="bold"
                textAnchor="middle"
                y={-5.5}
              >
                🎓 {campus.shortName}
              </text>
            </g>

            {/* Rich Hover Popup Card in SVG */}
            {isHovered && (
              <g
                className="pointer-events-none"
                filter="drop-shadow(0 6px 12px rgba(0,0,0,0.2))"
                transform={`translate(${x > 320 ? x - 190 : x + 16}, ${
                  y > 450 ? y - 110 : y - 20
                })`}
              >
                <rect
                  fill="var(--color-card-background, #ffffff)"
                  height={94}
                  rx={8}
                  stroke="var(--color-brand-500, #3b82f6)"
                  strokeOpacity={0.5}
                  strokeWidth={1.5}
                  width={180}
                />
                <text
                  fill="var(--color-brand-500, #3b82f6)"
                  fontSize={10}
                  fontWeight="bold"
                  letterSpacing="0.05em"
                  x={12}
                  y={18}
                >
                  {campus.region.toUpperCase()}
                </text>
                <text
                  fill="var(--color-text-primary, #0f172a)"
                  fontSize={11}
                  fontWeight="bold"
                  x={12}
                  y={34}
                >
                  {campus.shortName}
                </text>
                <text
                  fill="var(--color-text-secondary, #475569)"
                  fontSize={9.5}
                  x={12}
                  y={49}
                >
                  {hasEnrollmentData
                    ? `Đã tuyển: ${new Intl.NumberFormat("vi-VN").format(campus.currentEnrolled)} / ${new Intl.NumberFormat("vi-VN").format(campus.target)} (${fillPercentage}%)`
                    : "Chưa có dữ liệu tuyển sinh"}
                </text>
                <rect
                  fill="var(--color-background-gray-primary, #e2e8f0)"
                  height={4}
                  rx={2}
                  width={156}
                  x={12}
                  y={56}
                />
                <rect
                  fill="var(--color-brand-500, #3b82f6)"
                  height={4}
                  rx={2}
                  width={(156 * Math.min(100, fillPercentage)) / 100}
                  x={12}
                  y={56}
                />
                <text
                  fill="var(--color-text-tertiary, #94a3b8)"
                  fontSize={8.5}
                  x={12}
                  y={74}
                >
                  Thế mạnh: {campus.highlightMajor}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}
