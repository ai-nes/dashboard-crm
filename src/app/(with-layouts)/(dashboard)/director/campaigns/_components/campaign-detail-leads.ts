import { defaultLeadOverlay } from "@/app/(with-layouts)/(dashboard)/director/leads/_components/lead-mock-overlay";
import {
  leadStageStatusOptions,
  type LeadResultStatus,
  type LeadStageStatus,
} from "@/app/(with-layouts)/(dashboard)/director/leads/_components/lead-status";
import type { LeadListItem } from "@/services/api/lead-sale";

export interface CampaignLeadRow {
  id: string;
  name: string;
  initials: string;
  phone: string;
  school: string;
  status: LeadStageStatus;
  result: LeadResultStatus | "";
  source: string;
  owner: string;
  contactNoAnswer: number;
  contactSuccess: number;
  note: string;
  createdAt: string;
}

export function toCampaignLeadRow(lead: LeadListItem): CampaignLeadRow {
  const candidate = String(
    lead.processingStatus ?? "",
  ).toUpperCase() as LeadStageStatus;
  const status = leadStageStatusOptions.includes(candidate) ? candidate : "NEW";
  return {
    id: lead.id,
    name: lead.name || lead.id,
    initials: lead.initials || lead.name.charAt(0).toUpperCase(),
    phone: lead.phone,
    school: lead.school,
    status,
    result: "",
    source: lead.source,
    owner: lead.owner,
    contactNoAnswer: 0,
    contactSuccess: 0,
    note: "",
    createdAt: lead.createdAt ?? "",
  };
}

const FIRST_NAMES = [
  "Nguyễn Minh",
  "Trần Thảo",
  "Lê Gia",
  "Phạm Thu",
  "Hoàng Đức",
  "Vũ Ngọc",
  "Đặng Bảo",
  "Bùi Khánh",
  "Đỗ Hoàng",
  "Ngô Thanh",
  "Dương Anh",
  "Lý Hải",
];

const LAST_NAMES = [
  "An",
  "Bình",
  "Chi",
  "Dương",
  "Hà",
  "Khang",
  "Linh",
  "My",
  "Nam",
  "Phúc",
  "Quân",
  "Trang",
];

const SCHOOLS = [
  "THPT Nguyễn Thị Minh Khai",
  "THPT Lê Quý Đôn",
  "THPT Chuyên Trần Đại Nghĩa",
  "THPT Nguyễn Du",
  "THPT Marie Curie",
  "THPT Bùi Thị Xuân",
  "THPT Gia Định",
  "THPT Nguyễn Hữu Huân",
];

const SOURCES = [
  "Facebook Ads",
  "TikTok Ads",
  "Website",
  "Zalo OA",
  "Giới thiệu",
  "Sự kiện tại trường",
];

const OWNERS = [
  "Nguyễn Văn Phúc",
  "Trần Thị Mai",
  "Lê Hoàng Anh",
  "Phạm Quốc Bảo",
  "Đỗ Thùy Linh",
];

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash || 1;
}

function createRng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function pick<T>(items: readonly T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length) % items.length];
}

export function generateCampaignLeads(campaignId: string): CampaignLeadRow[] {
  const rng = createRng(hashSeed(campaignId));
  const total = 10 + Math.floor(rng() * 12);

  return Array.from({ length: total }, (_, index) => {
    const firstName = pick(FIRST_NAMES, rng);
    const lastName = pick(LAST_NAMES, rng);
    const name = `${firstName} ${lastName}`;
    const phone = `09${Math.floor(10000000 + rng() * 89999999)}`;
    const id = `${campaignId}-lead-${index + 1}`;
    const overlay = defaultLeadOverlay(id);

    return {
      id,
      name,
      initials: lastName.charAt(0).toUpperCase(),
      phone,
      school: pick(SCHOOLS, rng),
      source: pick(SOURCES, rng),
      owner: pick(OWNERS, rng),
      status: overlay.status,
      result: overlay.result,
      contactNoAnswer: overlay.contactNoAnswer,
      contactSuccess: overlay.contactSuccess,
      note: overlay.note,
      createdAt: overlay.createdAt,
    };
  });
}
