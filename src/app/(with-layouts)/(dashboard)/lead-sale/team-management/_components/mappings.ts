import type { TeamMemberRole } from "./types";

export const teamMemberRoleLabel: Record<TeamMemberRole, string> = {
  SALE: "Nhân viên kinh doanh",
  CTV_SALE: "Cộng tác viên",
};

export const teamMemberRoleColor: Record<TeamMemberRole, "primary" | "sky"> = {
  SALE: "primary",
  CTV_SALE: "sky",
};

export const teamMemberRoleOptions: TeamMemberRole[] = ["SALE", "CTV_SALE"];
