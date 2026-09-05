export type MemberAvailability = "active" | "away" | "leave";
export type MemberHealth = "good" | "support";

export interface SalesTeamMember {
  id: string;
  name: string;
  initials: string;
  email: string;
  availability: MemberAvailability;
  health: MemberHealth;
  activeStudents: number;
  capacity: number;
  loadRate: number | null;
  consultedToday: number;
  admittedThisMonth: number;
  overdue: number;
  conversionRate: number | null;
  regions: string[];
  specialties: string[];
  lastActivity: string;
  supportReason: string | null;
}

export type TeamAvailabilityFilter = "all" | MemberAvailability;
export type TeamSort = "support" | "load" | "name";

export interface TeamOverviewSummary {
  memberCount: number;
  activeMemberCount: number;
  assignedStudents: number;
  totalCapacity: number;
  loadRate: number | null;
  supportMemberCount: number;
  overdueStudents: number;
}

export interface TeamAttentionMember {
  id: string;
  name: string;
  initials: string;
  availability: MemberAvailability;
  health: "support";
  activeStudents: number;
  capacity: number;
  loadRate: number | null;
  overdue: number;
  supportReason: string;
}

export interface TeamLoadSummaryData {
  assignedStudents: number;
  totalCapacity: number;
  loadRate: number | null;
  topMembers: Array<{
    id: string;
    name: string;
    initials: string;
    activeStudents: number;
    capacity: number;
    loadRate: number | null;
    health: MemberHealth;
  }>;
}

export interface TeamPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}
