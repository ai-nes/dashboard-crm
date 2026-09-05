"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { Card } from "@/components/tailgrids/core/card";
import { useSalesTeamMemberDetailQuery, useSalesTeamWorkspaceQuery } from "@/hooks/use-lead-sale-sales-team-queries";
import type {
  SalesTeamAttentionItem,
  SalesTeamMember as ApiSalesTeamMember,
  SalesTeamWorkspaceResponse,
} from "@/services/api/lead-sale";

import TeamAttention from "./team-attention";
import TeamHeader from "./team-header";
import TeamLoadSummary from "./team-load-summary";
import TeamMemberDetail from "./team-member-detail";
import TeamMemberTable from "./team-member-table";
import TeamOverview from "./team-overview";
import type {
  SalesTeamMember,
  TeamAttentionMember,
  TeamAvailabilityFilter,
  TeamLoadSummaryData,
  TeamSort,
} from "./types";

const PAGE_SIZE = 50;

export default function SalesTeamWorkspace() {
  const [query, setQuery] = useState("");
  const [availability, setAvailability] =
    useState<TeamAvailabilityFilter>("all");
  const [sort, setSort] = useState<TeamSort>("support");
  const [page, setPage] = useState(1);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const order: "asc" | "desc" = sort === "name" ? "asc" : "desc";
  const workspaceParams = useMemo(
    () => ({
      availability,
      q: query,
      page,
      pageSize: PAGE_SIZE,
      sort,
      order,
    }),
    [availability, order, page, query, sort],
  );
  const workspaceQuery = useSalesTeamWorkspaceQuery(workspaceParams, {
    placeholderData: keepPreviousData,
  });
  const workspace = workspaceQuery.data;
  const selectedPreview = useMemo(
    () => findSelectedPreview(workspace, selectedMemberId),
    [selectedMemberId, workspace],
  );
  const detailQuery = useSalesTeamMemberDetailQuery(
    workspace && selectedMemberId
      ? {
          memberId: selectedMemberId,
          admissionYear: workspace.meta.admissionYear,
          date: workspace.meta.date,
          timezone: workspace.meta.timezone,
        }
      : null,
  );

  const members = useMemo(
    () => workspace?.members.map(mapMember) ?? [],
    [workspace?.members],
  );
  const attentionMembers = useMemo(
    () => workspace?.attention.items.map(mapAttentionMember) ?? [],
    [workspace?.attention.items],
  );
  const loadSummary = useMemo(
    () => (workspace ? mapLoadSummary(workspace) : null),
    [workspace],
  );
  const selectedMember = detailQuery.data?.member
    ? mapMember(detailQuery.data.member)
    : selectedPreview;

  const resetFilters = () => {
    setQuery("");
    setAvailability("all");
    setSort("support");
    setPage(1);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const handleAvailabilityChange = (value: TeamAvailabilityFilter) => {
    setAvailability(value);
    setPage(1);
  };

  const handleSortChange = (value: TeamSort) => {
    setSort(value);
    setPage(1);
  };

  if (!workspace && workspaceQuery.isPending) return <WorkspaceLoading />;

  if (!workspace && workspaceQuery.isError) {
    return (
      <main id="main-content" className="mx-auto max-w-[1600px] px-2 py-4 lg:px-6">
        <Card className="border-error-200 bg-badge-error-background p-5 text-error-600">
          <p className="text-sm font-semibold">Không thể tải dữ liệu đội ngũ Sale</p>
          <p className="mt-1 text-sm">{workspaceQuery.error.message}</p>
        </Card>
      </main>
    );
  }

  if (!workspace || !loadSummary) return null;

  return (
    <main
      id="main-content"
      className="mx-auto min-w-0 max-w-[1600px] space-y-5 overflow-x-hidden px-2 py-4 pb-10 lg:space-y-6 lg:px-6"
    >
      <TeamHeader meta={workspace.meta} />

      {workspace.meta.status === "partial" && workspace.meta.warnings.length > 0 && (
        <Card className="border-badge-warning-border bg-badge-warning-background p-4 text-sm text-badge-warning-text">
          Dữ liệu đang cập nhật một phần: {workspace.meta.warnings.join(", ")}
        </Card>
      )}

      <TeamOverview summary={workspace.summary} />

      <section
        aria-label="Tình hình cần theo dõi và phân bổ học sinh"
        className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2"
      >
        <TeamAttention
          members={attentionMembers}
          onSelect={setSelectedMemberId}
        />
        <TeamLoadSummary summary={loadSummary} asOf={workspace.meta.asOf} />
      </section>

      <TeamMemberTable
        members={members}
        query={query}
        onQueryChange={handleQueryChange}
        availability={availability}
        onAvailabilityChange={handleAvailabilityChange}
        sort={sort}
        onSortChange={handleSortChange}
        onSelect={(member) => setSelectedMemberId(member.id)}
        onReset={resetFilters}
        pagination={workspace.pagination}
        asOf={workspace.meta.asOf}
        onPageChange={setPage}
      />

      <TeamMemberDetail
        member={selectedMember}
        onClose={() => setSelectedMemberId(null)}
        isLoading={Boolean(selectedMemberId) && detailQuery.isPending}
        errorMessage={detailQuery.isError ? detailQuery.error.message : null}
      />
    </main>
  );
}

function mapMember(member: ApiSalesTeamMember): SalesTeamMember {
  return {
    id: member.id,
    name: member.displayName,
    initials: initials(member.displayName),
    email: member.email,
    availability: member.availability,
    health: member.health,
    activeStudents: member.activeStudents,
    capacity: member.capacity,
    loadRate: member.loadRate,
    consultedToday: member.consultedToday,
    admittedThisMonth: member.admittedThisMonth,
    overdue: member.overdue,
    conversionRate: member.conversionRate,
    regions: member.regions,
    specialties: member.specialties,
    lastActivity: formatLastActivity(member.lastActivityAt),
    supportReason: member.supportReason,
  };
}

function mapAttentionMember(item: SalesTeamAttentionItem): TeamAttentionMember {
  return {
    id: item.memberId,
    name: item.displayName,
    initials: initials(item.displayName),
    availability: item.availability,
    health: item.health,
    activeStudents: item.activeStudents,
    capacity: item.capacity,
    loadRate: item.loadRate,
    overdue: item.overdue,
    supportReason: item.supportReason,
  };
}

function mapLoadSummary(workspace: SalesTeamWorkspaceResponse): TeamLoadSummaryData {
  return {
    assignedStudents: workspace.loadSummary.assignedStudents,
    totalCapacity: workspace.loadSummary.totalCapacity,
    loadRate: workspace.loadSummary.loadRate,
    topMembers: workspace.loadSummary.topMembers.map((member) => ({
      id: member.memberId,
      name: member.displayName,
      initials: initials(member.displayName),
      activeStudents: member.activeStudents,
      capacity: member.capacity,
      loadRate: member.loadRate,
      health: member.health,
    })),
  };
}

function findSelectedPreview(
  workspace: SalesTeamWorkspaceResponse | undefined,
  memberId: string | null,
): SalesTeamMember | null {
  if (!workspace || !memberId) return null;
  const fullMember = workspace.members.find((member) => member.id === memberId);
  if (fullMember) return mapMember(fullMember);
  const attention = workspace.attention.items.find((item) => item.memberId === memberId);
  return attention ? mapAttentionPreview(attention) : null;
}

function mapAttentionPreview(item: SalesTeamAttentionItem): SalesTeamMember {
  return {
    ...mapAttentionMember(item),
    email: "",
    loadRate: item.loadRate,
    consultedToday: 0,
    admittedThisMonth: 0,
    conversionRate: null,
    regions: [],
    specialties: [],
    lastActivity: "Đang tải…",
  };
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "--";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatLastActivity(value: string | null): string {
  if (!value) return "Chưa ghi nhận hoạt động";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Chưa ghi nhận hoạt động";
  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - parsed.getTime()) / 60000));
  if (elapsedMinutes < 5) return "Vừa hoạt động";
  if (elapsedMinutes < 60) return `${elapsedMinutes} phút trước`;
  if (elapsedMinutes < 24 * 60) return `${Math.floor(elapsedMinutes / 60)} giờ trước`;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function WorkspaceLoading() {
  return (
    <main
      id="main-content"
      className="mx-auto max-w-[1600px] space-y-5 px-2 py-4 lg:px-6"
      aria-busy="true"
    >
      <Card className="h-44 animate-pulse bg-card-background" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} className="h-32 animate-pulse bg-card-background" />
        ))}
      </div>
      <Card className="h-96 animate-pulse bg-card-background" />
    </main>
  );
}
