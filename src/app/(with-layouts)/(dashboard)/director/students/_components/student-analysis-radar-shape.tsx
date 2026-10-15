"use client";
import { useId } from "react";
import {
  radarSegments,
  type AnalysisRadarPoint,
} from "./student-analysis-view";

interface Props {
  points?: AnalysisRadarPoint[];
  selectedCode?: string;
  previous?: boolean;
}
/** Omit unknown axes; shade only sectors whose two boundary values are known. */
export default function StudentAnalysisRadarShape({
  points = [],
  selectedCode,
  previous = false,
}: Props) {
  const fillId = useId();
  const known = points.filter(
    (p) => typeof p.value === "number" && Number.isFinite(p.value),
  );
  const color = previous ? "var(--info-500)" : "var(--primary-700)";
  const complete = points.length > 2 && known.length === points.length;
  const segments = radarSegments(points);
  const center = points.find(
    (p) => Number.isFinite(p.cx) && Number.isFinite(p.cy),
  );
  const areaColor = previous ? "var(--info-500)" : "var(--primary-500)";
  const fill = `url(#${fillId})`;
  return (
    <g
      aria-hidden="true"
      data-analysis-radar={previous ? "previous" : "current"}
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor={areaColor}
            stopOpacity={previous ? 0.3 : 0.6}
          />
          <stop
            offset="100%"
            stopColor={areaColor}
            stopOpacity={previous ? 0.1 : 0.2}
          />
        </linearGradient>
      </defs>
      {!complete && center && segments.length > 0 && (
        <path
          data-radar-fill={previous ? "previous" : "current"}
          d={segments
            .map(
              (line) => `M${center.cx},${center.cy}${line.replace(/^M/, "L")}Z`,
            )
            .join(" ")}
          fill={fill}
          stroke="none"
        />
      )}
      {complete ? (
        <polygon
          points={points.map((p) => `${p.x},${p.y}`).join(" ")}
          data-radar-fill={previous ? "previous" : "current"}
          fill={fill}
          stroke={color}
          strokeWidth={2}
          strokeDasharray={previous ? "5 4" : undefined}
        />
      ) : (
        segments.map((line, i) => (
          <path
            key={i}
            d={line}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeDasharray={previous ? "5 4" : undefined}
          />
        ))
      )}
      {known.map((p, i) => (
        <circle
          key={i}
          data-dimension-point={previous ? undefined : p.payload?.code}
          data-previous-dimension-point={previous ? p.payload?.code : undefined}
          cx={p.x}
          cy={p.y}
          r={previous ? 5 : p.payload?.code === selectedCode ? 6 : 3.5}
          fill={
            previous
              ? "none"
              : p.payload?.code === selectedCode
                ? color
                : "var(--card-background)"
          }
          stroke={color}
          strokeWidth={2}
        />
      ))}
    </g>
  );
}
