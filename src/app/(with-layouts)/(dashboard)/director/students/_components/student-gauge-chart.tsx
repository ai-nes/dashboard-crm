"use client";

import { useMemo } from "react";
import { Badge } from "@/components/tailgrids/core/badge";
import { cn } from "@/utils/cn";

interface StudentGaugeChartProps {
  score: number; // 0 to 100
  statusText?: string;
  label?: string;
  className?: string;
}

// Center & radii for 200x120 SVG viewBox
const CX = 100;
const CY = 96;
const OUTER_R = 80;
const INNER_R = 64;
const NEEDLE_R = 72;

// Helper to convert polar degrees to Cartesian coordinates
// 180° is left (-x), 90° is top (-y), 0° is right (+x)
function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY - radius * Math.sin(angleInRadians),
  };
}

// Helper to generate SVG path for an arc ring slice
function createArcSlice(startAngle: number, endAngle: number) {
  const startOuter = polarToCartesian(CX, CY, OUTER_R, startAngle);
  const endOuter = polarToCartesian(CX, CY, OUTER_R, endAngle);
  const startInner = polarToCartesian(CX, CY, INNER_R, endAngle);
  const endInner = polarToCartesian(CX, CY, INNER_R, startAngle);

  const arcSweep = startAngle - endAngle <= 180 ? "0" : "1";

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${OUTER_R} ${OUTER_R} 0 ${arcSweep} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${INNER_R} ${INNER_R} 0 ${arcSweep} 0 ${endInner.x} ${endInner.y}`,
    "Z",
  ].join(" ");
}

// Background track path from 180° to 0°
const BACKGROUND_TRACK_PATH = createArcSlice(180, 0);

// 3 segments with 3° clean gaps:
// Red/Error (Cần chú ý / 0 - 39): 180° down to 123°
// Amber/Warning (Tiềm năng vừa / 40 - 69): 120° down to 60°
// Emerald/Success (Tiềm năng cao / 70 - 100): 57° down to 0°
const SEGMENT1_PATH = createArcSlice(180, 123);
const SEGMENT2_PATH = createArcSlice(120, 60);
const SEGMENT3_PATH = createArcSlice(57, 0);

export default function StudentGaugeChart({
  score = 85,
  statusText,
  label = "Điểm tiềm năng",
  className,
}: StudentGaugeChartProps) {
  const clampedScore = Math.max(0, Math.min(100, score));

  // Xác định nhãn trạng thái và màu sắc huy hiệu tương ứng
  const { status, badgeColor } = useMemo(() => {
    if (clampedScore >= 70) {
      return {
        status: statusText || "Tiềm năng cao",
        badgeColor: "success" as const,
      };
    }
    if (clampedScore >= 40) {
      return {
        status: statusText || "Tiềm năng vừa",
        badgeColor: "warning" as const,
      };
    }
    return {
      status: statusText || "Cần chú ý",
      badgeColor: "error" as const,
    };
  }, [clampedScore, statusText]);

  // Needle angle: 0% score is at 180° (left), 100% score is at 0° (right)
  const targetAngle = 180 - (clampedScore / 100) * 180;

  // Precision dial pointer coordinates
  const tip = polarToCartesian(CX, CY, NEEDLE_R, targetAngle);
  const baseLeft = polarToCartesian(CX, CY, 5, targetAngle + 90);
  const baseRight = polarToCartesian(CX, CY, 5, targetAngle - 90);
  const tail = polarToCartesian(CX, CY, 9, targetAngle + 180);
  const pointerPath = `M ${tail.x} ${tail.y} L ${baseLeft.x} ${baseLeft.y} L ${tip.x} ${tip.y} L ${baseRight.x} ${baseRight.y} Z`;

  return (
    <div className={cn("flex flex-col items-center justify-center select-none", className)}>
      <div className="relative w-52 sm:w-56">
        <svg
          viewBox="0 0 200 120"
          className="w-full overflow-visible drop-shadow-xs"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Subtle background track for depth */}
          <path
            d={BACKGROUND_TRACK_PATH}
            className="fill-background-soft-100 dark:fill-background-soft-300/30"
          />

          {/* Segment 1: Low (Cần chú ý) */}
          <path
            d={SEGMENT1_PATH}
            className="fill-error-500/80 transition-colors dark:fill-error-500"
          />

          {/* Segment 2: Moderate (Tiềm năng vừa) */}
          <path
            d={SEGMENT2_PATH}
            className="fill-warning-500/85 transition-colors dark:fill-warning-500"
          />

          {/* Segment 3: High (Tiềm năng cao) */}
          <path
            d={SEGMENT3_PATH}
            className="fill-success-500/90 transition-colors dark:fill-success-500"
          />

          {/* Min & Max scale indicators */}
          <text
            x="18"
            y="112"
            textAnchor="middle"
            className="fill-text-tertiary text-[10px] font-medium"
          >
            0
          </text>
          <text
            x="182"
            y="112"
            textAnchor="middle"
            className="fill-text-tertiary text-[10px] font-medium"
          >
            100
          </text>

          {/* Large crisp score inside the dial */}
          <text
            x={CX}
            y={66}
            textAnchor="middle"
            className="fill-text-primary text-2xl font-bold tracking-tight"
          >
            {clampedScore}
            <tspan className="fill-text-tertiary text-[11px] font-medium">/100</tspan>
          </text>

          {/* Precision dial pointer needle */}
          <path
            d={pointerPath}
            className="fill-slate-800 transition-transform duration-700 ease-out dark:fill-slate-100 drop-shadow-xs"
          />

          {/* Center metallic pivot hub */}
          <circle
            cx={CX}
            cy={CY}
            r={7}
            className="fill-slate-900 shadow-sm dark:fill-slate-100"
          />
          <circle
            cx={CX}
            cy={CY}
            r={2.5}
            className="fill-white dark:fill-slate-900"
          />
        </svg>
      </div>

      {/* High-contrast status badge & label */}
      <div className="mt-1 flex flex-col items-center">
        <Badge color={badgeColor} size="sm" className="font-semibold tracking-wide shadow-2xs">
          {status}
        </Badge>
        <p className="mt-1.5 text-center text-xs font-semibold tracking-wider text-text-tertiary uppercase">
          {label}
        </p>
      </div>
    </div>
  );
}
