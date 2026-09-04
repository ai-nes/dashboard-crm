import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import type { FunnelStage } from "./data";

interface ResultFunnelProps {
  stages: FunnelStage[];
}

const VIEWBOX_WIDTH = 840;
const VIEWBOX_HEIGHT = 420;
const FUNNEL_CENTER = 470;
const MAX_FUNNEL_WIDTH = 620;
const STAGE_HEIGHT = 62;
const STAGE_GAP = 7;
const FUNNEL_TOP = 18;

function funnelPoints(currentWidth: number, nextWidth: number, y: number): string {
  const currentLeft = FUNNEL_CENTER - currentWidth / 2;
  const currentRight = FUNNEL_CENTER + currentWidth / 2;
  const nextLeft = FUNNEL_CENTER - nextWidth / 2;
  const nextRight = FUNNEL_CENTER + nextWidth / 2;
  const bottom = y + STAGE_HEIGHT;

  return `${currentLeft},${y} ${currentRight},${y} ${nextRight},${bottom} ${nextLeft},${bottom}`;
}

interface FunnelStageShapeProps {
  assignedCount: number;
  index: number;
  stage: FunnelStage;
  nextStage?: FunnelStage;
}

function FunnelStageShape({ assignedCount, index, nextStage, stage }: FunnelStageShapeProps) {
  const y = FUNNEL_TOP + index * (STAGE_HEIGHT + STAGE_GAP);
  const currentWidth = MAX_FUNNEL_WIDTH * (stage.value / assignedCount);
  const nextWidth = nextStage ? MAX_FUNNEL_WIDTH * (nextStage.value / assignedCount) : 0;
  const labelY = y + STAGE_HEIGHT / 2 + 1;

  return (
    <g>
      <title>
        {stage.label}: {stage.value} hồ sơ
      </title>
      <polygon
        points={funnelPoints(currentWidth, nextWidth, y)}
        fill={stage.color}
        stroke="var(--card-background)"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <text
        x={28}
        y={labelY}
        fill="var(--text-secondary)"
        fontSize={16}
        fontWeight={600}
        textAnchor="start"
        dominantBaseline="middle"
      >
        {stage.label}
      </text>
      <text
        x={FUNNEL_CENTER}
        y={labelY}
        fill="var(--text-primary)"
        fontSize={21}
        fontWeight={700}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {stage.value}
      </text>
    </g>
  );
}

export default function ResultFunnel({ stages }: ResultFunnelProps) {
  const assignedCount = stages[0]?.value ?? 0;
  const lastStage = stages[stages.length - 1];
  const conversionRate = assignedCount && lastStage ? Math.round((lastStage.value / assignedCount) * 100) : 0;

  return (
    <Card className="min-w-0 p-5 sm:p-6 lg:h-full">
      <CardHeader className="items-start">
        <div>
          <CardTitle>Phễu chuyển đổi</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Số hồ sơ thu hẹp qua từng bước tư vấn.</p>
        </div>
        <span className="rounded-full bg-background-soft-50 px-2.5 py-1 text-[11px] font-medium text-text-secondary">{assignedCount} hồ sơ</span>
      </CardHeader>

      <div className="mt-4 w-full" role="img" aria-label="Biểu đồ phễu chuyển đổi từ được giao đến chuyển Sale">
        <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} className="block h-auto w-full" preserveAspectRatio="xMidYMid meet">
          <desc>Funnel chart gồm các bước Được giao, Đã liên hệ, Kết nối, Có nhu cầu và Chuyển Sale.</desc>
          {assignedCount > 0 && stages.map((stage, index) => (
            <FunnelStageShape
              key={stage.id}
              assignedCount={assignedCount}
              index={index}
              stage={stage}
              nextStage={stages[index + 1]}
            />
          ))}
        </svg>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-card-border pt-4 text-[11px]">
        <span className="text-text-tertiary">Tỷ lệ chuyển đổi cuối phễu</span>
        <span className="font-semibold text-success-600">{conversionRate}%</span>
      </div>

      <div className="mt-5 rounded-xl border border-primary-200 bg-badge-primary-background px-3.5 py-3">
        <p className="text-xs font-semibold text-badge-primary-text">Điểm cần chú ý</p>
        <p className="mt-1 text-xs leading-5 text-text-secondary">Tỷ lệ từ kết nối sang có nhu cầu đang là bước cần ưu tiên cải thiện.</p>
      </div>
    </Card>
  );
}
