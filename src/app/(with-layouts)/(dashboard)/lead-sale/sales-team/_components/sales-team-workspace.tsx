"use client";

import { useMemo, useState } from "react";

import TeamAttention from "./team-attention";
import { salesTeamMembers } from "./data";
import TeamHeader from "./team-header";
import TeamLoadSummary from "./team-load-summary";
import TeamMemberDetail from "./team-member-detail";
import TeamMemberTable from "./team-member-table";
import TeamOverview from "./team-overview";
import type {
  SalesTeamMember,
  TeamAvailabilityFilter,
  TeamSort,
} from "./types";

const normalize = (value: string) =>
  value
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

export default function SalesTeamWorkspace() {
  const [query, setQuery] = useState("");
  const [availability, setAvailability] =
    useState<TeamAvailabilityFilter>("all");
  const [sort, setSort] = useState<TeamSort>("support");
  const [selectedMember, setSelectedMember] =
    useState<SalesTeamMember | null>(null);

  const filteredMembers = useMemo(() => {
    const normalizedQuery = normalize(query.trim());
    return salesTeamMembers
      .filter((member) => {
        const matchesAvailability =
          availability === "all" || member.availability === availability;
        const matchesQuery =
          !normalizedQuery ||
          normalize(`${member.name} ${member.email}`).includes(normalizedQuery);
        return matchesAvailability && matchesQuery;
      })
      .sort((a, b) => {
        if (sort === "name") return a.name.localeCompare(b.name, "vi");
        if (sort === "load") {
          return b.activeStudents / b.capacity - a.activeStudents / a.capacity;
        }
        return (
          Number(b.health === "support") - Number(a.health === "support") ||
          b.overdue - a.overdue ||
          b.activeStudents / b.capacity - a.activeStudents / a.capacity
        );
      });
  }, [availability, query, sort]);

  const resetFilters = () => {
    setQuery("");
    setAvailability("all");
    setSort("support");
  };

  return (
    <main
      id="main-content"
      className="mx-auto min-w-0 max-w-[1600px] space-y-5 overflow-x-hidden px-2 py-4 pb-10 lg:space-y-6 lg:px-6"
    >
      <TeamHeader />
      <TeamOverview members={salesTeamMembers} />

      <section
        aria-label="Tình hình cần theo dõi và phân bổ học sinh"
        className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2"
      >
        <TeamAttention
          members={salesTeamMembers}
          onSelect={setSelectedMember}
        />
        <TeamLoadSummary members={salesTeamMembers} />
      </section>

      <TeamMemberTable
        members={filteredMembers}
        query={query}
        onQueryChange={setQuery}
        availability={availability}
        onAvailabilityChange={setAvailability}
        sort={sort}
        onSortChange={setSort}
        onSelect={setSelectedMember}
        onReset={resetFilters}
      />

      <TeamMemberDetail
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </main>
  );
}
