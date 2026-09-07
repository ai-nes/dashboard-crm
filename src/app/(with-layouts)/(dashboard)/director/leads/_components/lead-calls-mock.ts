export type LeadCallDirection = "inbound" | "outbound" | "missed";

export type LeadCallOutcome = "connected" | "missed" | "no-answer" | "callback";

export interface LeadCallRecord {
  id: string;
  time: string;
  direction: LeadCallDirection;
  outcome: LeadCallOutcome;
  callerName: string;
  receiverName: string;
  callerRole?: string;
  receiverRole?: string;
  phoneNumber?: string;
  durationSeconds?: number;
  topic?: string;
  summary?: string;
  recordingUrl?: string;
}

// Fixed anchor so mock data stays deterministic across server/client renders.
const REFERENCE_DATE = new Date("2026-09-07T00:00:00Z").getTime();

const TOPICS = [
  "Tư vấn thông tin tuyển sinh",
  "Xác nhận thông tin liên hệ",
  "Giải đáp học phí, học bổng",
  "Mời tham gia sự kiện tư vấn",
  "Nhắc lịch nộp hồ sơ",
];

const SUMMARIES = [
  "",
  "",
  "Phụ huynh hẹn gọi lại chiều mai.",
  "Lead quan tâm học bổng, cần gửi thêm thông tin.",
  "Đã xác nhận lịch tham quan campus.",
  "Không liên lạc được, sẽ thử lại sau.",
];

const OUTCOMES: LeadCallOutcome[] = ["connected", "missed", "no-answer", "callback"];

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

export function generateLeadCalls(lead: {
  id: string;
  name: string;
  phone: string;
  owner: string;
}): LeadCallRecord[] {
  const rng = createRng(hashSeed(lead.id));
  const callCount = 2 + Math.floor(rng() * 4);
  const agentName = lead.owner || "CTV Sale";

  return Array.from({ length: callCount }, (_, index) => {
    const outcome = pick(OUTCOMES, rng);
    const direction: LeadCallDirection = outcome === "missed" ? "missed" : rng() > 0.4 ? "outbound" : "inbound";
    const isOutbound = direction !== "inbound";
    const daysAgo = index * 3 + Math.floor(rng() * 3);
    const time = new Date(REFERENCE_DATE - daysAgo * 24 * 60 * 60 * 1000).toISOString();
    const durationSeconds =
      outcome === "connected" || outcome === "callback" ? 30 + Math.floor(rng() * 240) : 0;

    return {
      id: `${lead.id}-call-${index}`,
      time,
      direction,
      outcome,
      callerName: isOutbound ? agentName : lead.name,
      receiverName: isOutbound ? lead.name : agentName,
      callerRole: isOutbound ? "CTV Sale" : undefined,
      receiverRole: isOutbound ? undefined : "CTV Sale",
      phoneNumber: lead.phone,
      durationSeconds,
      topic: pick(TOPICS, rng),
      summary: pick(SUMMARIES, rng),
      recordingUrl: undefined,
    };
  });
}
