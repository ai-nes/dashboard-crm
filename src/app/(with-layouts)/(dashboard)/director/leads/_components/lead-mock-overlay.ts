import {
  canEditLeadResult,
  leadResultOptions,
  leadStageStatusOptions,
  type LeadResultStatus,
  type LeadStageStatus,
} from "./lead-status";

export interface LeadMockOverlay {
  status: LeadStageStatus;
  result: LeadResultStatus | "";
  contactNoAnswer: number;
  contactSuccess: number;
  note: string;
  createdAt: string;
}

// Fixed anchor so mock data stays deterministic across server/client renders.
const REFERENCE_DATE = new Date("2026-09-07T00:00:00Z").getTime();

const NOTES = [
  "",
  "",
  "Phụ huynh hẹn gọi lại chiều mai",
  "Đang cân nhắc học phí",
  "Đã hẹn tư vấn trực tiếp tại campus",
  "Không liên lạc được, thử lại sau",
  "Quan tâm ngành Công nghệ thông tin",
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

export function defaultLeadOverlay(id: string): LeadMockOverlay {
  const rng = createRng(hashSeed(id));
  const status = pick(leadStageStatusOptions, rng);
  const result: LeadResultStatus | "" =
    canEditLeadResult(status) && rng() > 0.35 ? pick(leadResultOptions, rng) : "";
  const contactNoAnswer = Math.floor(rng() * 4);
  const contactSuccess = Math.floor(rng() * 3);
  const note = pick(NOTES, rng);
  const daysAgo = Math.floor(rng() * 45);
  const createdAt = new Date(REFERENCE_DATE - daysAgo * 24 * 60 * 60 * 1000).toISOString();

  return { status, result, contactNoAnswer, contactSuccess, note, createdAt };
}
