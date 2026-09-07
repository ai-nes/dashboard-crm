import type { BigTeam, SmallTeam, TeamMember } from "./types";

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return name.slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function member(id: string, name: string, role: TeamMember["role"]): TeamMember {
  const email = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .trim()
    .split(/\s+/)
    .join(".")
    .toLowerCase();
  return { id, name, initials: initialsFrom(name), email: `${email}@example.test`, role };
}

export const initialMembers: TeamMember[] = [
  member("m-01", "Nguyễn Văn An", "SALE"),
  member("m-02", "Trần Thị Bình", "SALE"),
  member("m-03", "Lê Văn Cường", "SALE"),
  member("m-04", "Phạm Thị Dung", "CTV_SALE"),
  member("m-05", "Hoàng Văn Em", "CTV_SALE"),
  member("m-06", "Vũ Thị Giang", "SALE"),
  member("m-07", "Đặng Văn Hải", "SALE"),
  member("m-08", "Bùi Thị Ivy", "CTV_SALE"),
  member("m-09", "Ngô Văn Khoa", "SALE"),
  member("m-10", "Lý Thị Lan", "SALE"),
  member("m-11", "Trịnh Văn Minh", "SALE"),
  member("m-12", "Đỗ Thị Ngọc", "CTV_SALE"),
  member("m-13", "Phan Văn Phúc", "CTV_SALE"),
  member("m-14", "Cao Thị Quỳnh", "SALE"),
  member("m-15", "Đinh Văn Sơn", "CTV_SALE"),
  member("m-16", "Huỳnh Văn Tâm", "SALE"),
  member("m-17", "Mai Thị Uyên", "CTV_SALE"),
  member("m-18", "Trương Thị Vân", "SALE"),
  member("m-19", "Lâm Văn Wyatt", "CTV_SALE"),
  member("m-20", "Ông Văn Xuân", "SALE"),
];

export const initialSmallTeams: SmallTeam[] = [
  {
    id: "st-a1",
    bigTeamId: "bt-a",
    name: "Team Hà Nội 1",
    leadId: "m-02",
    memberIds: ["m-02", "m-03", "m-04", "m-05"],
  },
  {
    id: "st-a2",
    bigTeamId: "bt-a",
    name: "Team Hà Nội 2",
    leadId: "m-06",
    memberIds: ["m-06", "m-07", "m-08"],
  },
  {
    id: "st-b1",
    bigTeamId: "bt-b",
    name: "Team HCM 1",
    leadId: "m-10",
    memberIds: ["m-10", "m-11", "m-12", "m-13"],
  },
  {
    id: "st-b2",
    bigTeamId: "bt-b",
    name: "Team HCM 2",
    leadId: null,
    memberIds: ["m-14", "m-15"],
  },
  {
    id: "st-c1",
    bigTeamId: "bt-c",
    name: "Team Đà Nẵng",
    leadId: "m-16",
    memberIds: ["m-16", "m-17"],
  },
];

export const initialBigTeams: BigTeam[] = [
  { id: "bt-a", name: "Team Sale Miền Bắc", groupLeadId: null, smallTeamIds: ["st-a1", "st-a2"] },
  { id: "bt-b", name: "Team Sale Miền Nam", groupLeadId: null, smallTeamIds: ["st-b1", "st-b2"] },
  { id: "bt-c", name: "Team Sale Miền Trung", groupLeadId: null, smallTeamIds: ["st-c1"] },
];
