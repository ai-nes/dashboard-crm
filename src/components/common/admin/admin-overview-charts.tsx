"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import type { ActivityLogEntry } from "@/services/api/activity-log";
import type { AdminOverviewVolume } from "./admin-overview-types";

interface ActivityPoint {
  date: string;
  label: string;
  total: number;
}

function getActivityPoints(logs: readonly ActivityLogEntry[]): ActivityPoint[] {
  const today = new Date();
  const points: ActivityPoint[] = [];
  const counts = new Map<string, number>();

  for (const log of logs) {
    const date = new Date(log.occurredAt);
    if (Number.isNaN(date.getTime())) continue;
    const key = date.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setHours(12, 0, 0, 0);
    date.setDate(today.getDate() - offset);
    const key = date.toISOString().slice(0, 10);
    points.push({
      date: key,
      label: date
        .toLocaleDateString("vi-VN", { weekday: "short" })
        .replace(".", ""),
      total: counts.get(key) ?? 0,
    });
  }

  return points;
}

function VolumeTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: AdminOverviewVolume }[];
}) {
  const item = payload?.[0]?.payload;
  if (!active || !item) return null;

  return (
    <div className="rounded-lg border border-card-border bg-card-background p-3 text-xs">
      <p className="font-semibold text-text-primary">{item.label}</p>
      <p className="mt-1 text-text-secondary">
        {item.value.toLocaleString("vi-VN")} bản ghi
      </p>
    </div>
  );
}

function ActivityTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: ActivityPoint }[];
}) {
  const item = payload?.[0]?.payload;
  if (!active || !item) return null;

  return (
    <div className="rounded-lg border border-card-border bg-card-background p-3 text-xs">
      <p className="font-semibold text-text-primary">{item.date}</p>
      <p className="mt-1 text-text-secondary">
        {item.total.toLocaleString("vi-VN")} hoạt động
      </p>
    </div>
  );
}

export function AdminOverviewConfigurationChart({
  data,
}: {
  data: readonly AdminOverviewVolume[];
}) {
  return (
    <Card className="min-w-0">
      <CardHeader className="mb-4 items-start">
        <div>
          <CardTitle>Quy mô cấu hình</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Số bản ghi hiện có ở từng nhóm quản trị.
          </p>
        </div>
        <span className="rounded-full bg-background-soft-100 px-2.5 py-1 text-[11px] font-medium text-text-secondary">
          Dữ liệu trực tiếp
        </span>
      </CardHeader>

      {data.length > 0 ? (
        <div className="h-72 min-w-0">
          <ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 44, left: 4, bottom: 4 }}
              barCategoryGap="22%"
            >
              <CartesianGrid
                horizontal={false}
                stroke="var(--border-color-base-100)"
              />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                axisLine={false}
                tickLine={false}
                width={92}
                tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
              />
              <Tooltip
                content={<VolumeTooltip />}
                cursor={{ fill: "var(--background-soft-50)" }}
              />
              <Bar dataKey="value" name="Bản ghi" radius={[0, 5, 5, 0]}>
                {data.map((item) => (
                  <Cell key={item.label} fill={item.color} />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  fill="var(--text-secondary)"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      ) : (
        <div className="flex h-72 items-center justify-center rounded-lg bg-background-soft-50 px-6 text-center text-sm text-text-secondary">
          Chưa có đủ dữ liệu để dựng biểu đồ cấu hình.
        </div>
      )}
    </Card>
  );
}

export default function AdminOverviewActivityChart({
  logs,
  isLoading,
}: {
  logs: readonly ActivityLogEntry[];
  isLoading: boolean;
}) {
  const data = getActivityPoints(logs);
  const hasRecentActivity = data.some((item) => item.total > 0);

  return (
    <Card className="min-w-0">
      <CardHeader className="mb-4 items-start">
        <div>
          <CardTitle>Hoạt động hệ thống</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Số sự kiện được ghi nhận trong 7 ngày gần đây.
          </p>
        </div>
        <span className="text-xs text-text-tertiary">
          Nhật ký toàn hệ thống
        </span>
      </CardHeader>

      {isLoading ? (
        <div className="h-72 animate-pulse rounded-lg bg-background-soft-100" />
      ) : logs.length === 0 || !hasRecentActivity ? (
        <div className="flex h-72 items-center justify-center rounded-lg bg-background-soft-50 px-6 text-center text-sm text-text-secondary">
          Chưa ghi nhận hoạt động nào trong 7 ngày gần đây.
        </div>
      ) : (
        <div className="h-72 min-w-0">
          <ChartContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: -22, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--border-color-base-100)"
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                width={30}
              />
              <Tooltip
                content={<ActivityTooltip />}
                cursor={{ fill: "var(--background-soft-50)" }}
              />
              <Bar
                dataKey="total"
                name="Hoạt động"
                fill="var(--primary-500)"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>
      )}
    </Card>
  );
}
