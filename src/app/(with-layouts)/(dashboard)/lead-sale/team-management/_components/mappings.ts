import type { TeamMemberRole } from "./types";

export const teamMemberRoleLabel: Record<TeamMemberRole, string> = {
  SALE: "Nhân viên kinh doanh",
  CTV_SALE: "Cộng tác viên",
  LEAD_SALE: "Trưởng nhóm",
};

export const teamMemberRoleColor: Record<
  TeamMemberRole,
  "primary" | "sky" | "success"
> = {
  SALE: "primary",
  CTV_SALE: "sky",
  LEAD_SALE: "success",
};

export const teamMemberRoleOptions: TeamMemberRole[] = ["SALE", "CTV_SALE"];
