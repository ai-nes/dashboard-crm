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
  consultedToday: number;
  admittedThisMonth: number;
  overdue: number;
  conversionRate: number;
  regions: string[];
  specialties: string[];
  lastActivity: string;
  supportReason?: string;
}

export type TeamAvailabilityFilter = "all" | MemberAvailability;
export type TeamSort = "support" | "load" | "name";
