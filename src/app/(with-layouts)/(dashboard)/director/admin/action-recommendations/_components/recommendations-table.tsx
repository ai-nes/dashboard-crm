"use client";

import { Eye, Shield1Check } from "@tailgrids/icons";
import { useMemo, useState } from "react";

import { Button } from "@/components/tailgrids/core/button";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";

import AdminTableToolbar from "./admin-table-toolbar";
import { MOCK_RECOMMENDATIONS } from "./mock-data";
import { ChannelLabel, PriorityBadge, RecommendationStatusBadge } from "./status-badges";
import type { MockRecommendation, SelectOption } from "./types";

interface RecommendationsTableProps {
  onInspect: (recommendation: MockRecommendation) => void;
}

const recommendationStatusOptions: SelectOption[] = [
  { id: "all", label: "Mọi trạng thái" },
  { id: "new", label: "Mới" },
  { id: "acknowledged", label: "Đã xem" },
  { id: "deferred", label: "Đã để sau" },
];

export default function RecommendationsTable({ onInspect }: RecommendationsTableProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const recommendations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return MOCK_RECOMMENDATIONS.filter((item) => {
      const matchesSearch = [item.id, item.studentName, item.studentCode, item.ruleLabel, item.actionLabel].some((value) => value.toLowerCase().includes(query));
      return matchesSearch && (status === "all" || item.status === status);
    });
  }, [search, status]);

  return (
    <section className="overflow-hidden rounded-xl border border-card-border bg-card-background" aria-labelledby="recommendations-heading">
      <div className="flex flex-wrap items-end justify-between gap-3 px-4 py-4">
        <div>
          <h2 id="recommendations-heading" className="text-base font-semibold text-text-primary">Đề xuất</h2>
          <p className="mt-1 text-sm text-text-secondary">Các đề xuất hệ thống đã tạo cho hồ sơ tuyển sinh. Màn hình này chỉ dùng để theo dõi.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-text-tertiary"><Shield1Check size={15} aria-hidden="true" />Chỉ xem · {recommendations.length} đề xuất</span>
      </div>

      <div className="flex items-start gap-2 border-y border-card-border bg-badge-primary-background px-4 py-3 text-xs leading-5 text-text-secondary">
        <Shield1Check size={15} className="mt-0.5 shrink-0 text-badge-primary-text" aria-hidden="true" />
        Đề xuất là kết quả do hệ thống tạo. Không chỉnh sửa hoặc xóa trực tiếp tại màn hình quản trị này.
      </div>

      <AdminTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchLabel="Tìm đề xuất"
        searchPlaceholder="Tìm theo mã hồ sơ, học sinh hoặc quy tắc"
        filters={[{ label: "Lọc theo trạng thái đề xuất", value: status, options: recommendationStatusOptions, onChange: setStatus }]}
      />

      <TableRoot fullBleed className="border-0">
        <TableHeader className="bg-background-gray-secondary">
          <TableRow>
            <TableHead>Hồ sơ tuyển sinh</TableHead>
            <TableHead>Quy tắc / hành động</TableHead>
            <TableHead>Ưu tiên</TableHead>
            <TableHead>Độ phù hợp</TableHead>
            <TableHead>Tác động dự kiến</TableHead>
            <TableHead>Hạn xử lý</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Chi tiết</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recommendations.map((recommendation) => (
            <TableRow key={recommendation.id} className="hover:bg-background-gray-secondary_alt">
              <TableCell className="min-w-56">
                <p className="font-semibold text-text-primary">{recommendation.studentName}</p>
                <p className="mt-1 font-mono text-[11px] text-text-tertiary">{recommendation.studentCode} · {recommendation.lifecycleStage}</p>
              </TableCell>
              <TableCell className="min-w-52">
                <p className="text-sm font-medium text-text-primary">{recommendation.actionLabel}</p>
                <p className="mt-1 text-xs text-text-secondary">{recommendation.ruleLabel}</p>
                <p className="mt-1 text-xs text-text-tertiary"><ChannelLabel channel={recommendation.channel} /></p>
              </TableCell>
              <TableCell><PriorityBadge priority={recommendation.priority} /></TableCell>
              <TableCell className="min-w-32">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-16 overflow-hidden rounded-full bg-background-gray-secondary"><span className="block h-full rounded-full bg-primary-500" style={{ width: `${recommendation.confidence}%` }} /></span>
                  <span className="text-sm font-medium text-text-primary">{recommendation.confidence}%</span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-text-secondary">{recommendation.expectedImpact}</TableCell>
              <TableCell className="min-w-36 text-sm text-text-secondary">{recommendation.expiresAt}</TableCell>
              <TableCell><RecommendationStatusBadge status={recommendation.status} /></TableCell>
              <TableCell className="text-right">
                <Button size="sm" appearance="ghost" onPress={() => onInspect(recommendation)} aria-label={`Xem đề xuất cho ${recommendation.studentName}`} className="text-primary-500 hover:bg-badge-primary-background">
                  <Eye size={16} aria-hidden="true" />
                  Xem
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {recommendations.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="py-12 text-center text-sm text-text-tertiary">Không tìm thấy đề xuất phù hợp.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </TableRoot>
    </section>
  );
}
