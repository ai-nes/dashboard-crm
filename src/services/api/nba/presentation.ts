import type { NbaRecommendation } from "./types";

export interface NbaFallbackFact {
  label: string;
  value: string;
}

export function actionLabel(actionId: string): string {
  const labels: Record<string, string> = {
    ACTIVATE_WINBACK: "Kích hoạt lại quan tâm",
    CALL_PARENT: "Gọi cho phụ huynh",
    SEND_INFORMATION: "Gửi lại thông tin",
    INVITE_EVENT: "Mời tham dự sự kiện",
    REQUEST_DOCUMENTS: "Yêu cầu bổ sung hồ sơ",
    HANDOFF: "Chuyển giao phụ trách",
  };

  return (
    labels[actionId] ??
    actionId
      .replace(/^[A-Z]+_/, "")
      .replaceAll("_", " ")
      .toLowerCase()
  );
}

export function formatNbaChannel(value: string | null): string {
  const channel = value?.trim();
  if (!channel || channel.toUpperCase() === "NONE") return "Chưa xác định";

  const labels: Record<string, string> = {
    CALL: "Gọi điện",
    EMAIL: "Email",
    MESSAGE: "Tin nhắn",
    SMS: "Tin nhắn SMS",
    ZALO: "Zalo",
    WHATSAPP: "WhatsApp",
  };

  return labels[channel.toUpperCase()] ?? channel;
}

export function getNbaFallbackFacts(
  payload: NbaRecommendation["aiPayload"],
): NbaFallbackFact[] {
  const facts: NbaFallbackFact[] = [];
  const readString = (keys: string[]) => {
    for (const key of keys) {
      const value = payload[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
    return null;
  };

  const timingWindow = readString(["timing_window", "timingWindow"]);
  if (timingWindow) {
    facts.push({ label: "Khung thời điểm", value: timingWindow });
  }

  const signalBand = readString([
    "score_band",
    "scoreBand",
    "signal_band",
    "signalBand",
  ]);
  if (signalBand) {
    facts.push({ label: "Mức tín hiệu", value: signalBand });
  }

  const evidenceReferences =
    payload.evidence_references ?? payload.evidenceReferences;
  if (Array.isArray(evidenceReferences) && evidenceReferences.length > 0) {
    facts.push({
      label: "Dữ kiện tham chiếu",
      value: `${evidenceReferences.length} nguồn dữ kiện liên quan`,
    });
  }

  return facts;
}

export function formatNbaDateTime(value: string): string {
  if (!value) return "chưa xác định";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
