import type {
  InteractionCatalogItem,
  InteractionSummary,
  IntentType,
} from "@/services/api/interaction-intelligence";

export const interactionChannelOptions = [
  { id: "all", label: "Tất cả kênh" },
  { id: "facebook", label: "Facebook" },
  { id: "webchat", label: "Webchat" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Điện thoại" },
  { id: "Internal", label: "Nội bộ" },
];

export const interactionDirectionOptions = [
  { id: "all", label: "Mọi hướng" },
  { id: "inbound", label: "Đến" },
  { id: "outbound", label: "Đã gửi" },
  { id: "internal", label: "Nội bộ" },
];

export const interactionStatusOptions = [
  { id: "all", label: "Mọi trạng thái" },
  { id: "open", label: "Đang mở" },
  { id: "sealed", label: "Đã đóng" },
];

export const interactionFamilyOptions = [
  { id: "all", label: "Mọi mục đích" },
  { id: "Conversation", label: "Trao đổi" },
  { id: "Counseling", label: "Tư vấn" },
  { id: "Application", label: "Hồ sơ" },
  { id: "Lifecycle", label: "Vòng đời hồ sơ" },
];

export function getInteractionLabel(
  interaction: InteractionSummary,
  catalog: Map<string, InteractionCatalogItem>,
): string {
  return (
    interaction.interaction_label?.trim() ||
    catalog.get(interaction.interaction_type)?.display_name?.trim() ||
    interaction.interaction_type
  );
}

export function isCallInteraction(interaction: InteractionSummary): boolean {
  const interactionType = interaction.interaction_type.trim().toUpperCase();
  const channel = interaction.channel?.trim().toLocaleLowerCase("en-US");

  return (
    interactionType === "PHONE_CALL" ||
    channel === "call" ||
    channel === "phone"
  );
}

export function getInteractionActivityTitle(
  interaction: InteractionSummary,
  catalog?: Map<string, InteractionCatalogItem>,
): string {
  const interactionType = interaction.interaction_type.trim().toUpperCase();
  const interactionLabel = interaction.interaction_label?.trim() || "";
  const normalizedLabel = interactionLabel.toLocaleLowerCase("en-US");
  const catalogLabel = catalog?.get(interactionType)?.display_name?.trim();
  const isLegacyType = ["CONNECTED", "COUNSELING", "MESSAGE_CHATWOOT"].includes(
    interactionType,
  );

  let sourceLabel: string;
  switch (interactionType) {
    case "CONNECTED":
    case "PHONE_CALL":
      sourceLabel = isCallInteraction(interaction)
        ? "Cuộc gọi tư vấn"
        : getMessageActivityLabel(interaction.channel);
      break;
    case "COUNSELING":
      sourceLabel = isCallInteraction(interaction)
        ? "Cuộc gọi tư vấn"
        : "Tư vấn tuyển sinh";
      break;
    case "MESSAGE":
    case "MESSAGE_CHATWOOT":
      sourceLabel = getMessageActivityLabel(interaction.channel);
      break;
    case "EMAIL":
      sourceLabel = "Email tư vấn";
      break;
    case "NOTE":
      sourceLabel = "Ghi chú tư vấn";
      break;
    case "MEETING":
      sourceLabel = "Buổi tư vấn";
      break;
    case "APPLICATION":
      sourceLabel = "Cập nhật hồ sơ xét tuyển";
      break;
    case "LIFECYCLE":
      sourceLabel = "Cập nhật trạng thái tuyển sinh";
      break;
    case "SYSTEM_ACTIVITY":
      sourceLabel = "Cập nhật hoạt động tuyển sinh";
      break;
    case "FORM_SUBMISSION":
      sourceLabel = "Gửi biểu mẫu";
      break;
    case "APPLICATION_UPDATE":
      sourceLabel = "Cập nhật hồ sơ";
      break;
    case "DOCUMENT_SUBMISSION":
      sourceLabel = "Nộp tài liệu";
      break;
    case "EVENT_PARTICIPATION":
      sourceLabel = "Tham gia sự kiện";
      break;
    case "PAYMENT":
      sourceLabel = "Thanh toán";
      break;
    case "OTHER":
      sourceLabel = "Hoạt động khác";
      break;
    default:
      sourceLabel =
        normalizedLabel === "counseling"
          ? "Cuộc gọi tư vấn"
          : interactionLabel || catalogLabel || interaction.interaction_type;
  }

  if (!isLegacyType && (interactionLabel || catalogLabel)) {
    sourceLabel = interactionLabel || catalogLabel || sourceLabel;
  }

  const summary = getInteractionActivitySummary(interaction);
  const hasDistinctSummary =
    summary &&
    summary.toLocaleLowerCase("en-US") !==
      sourceLabel.toLocaleLowerCase("en-US");
  return hasDistinctSummary ? `${sourceLabel} · ${summary}` : sourceLabel;
}

export function getInteractionActivitySummary(
  interaction: InteractionSummary,
): string | null {
  const summary = interaction.summary?.trim() || interaction.outcome?.trim();
  if (!summary) return null;

  switch (summary.toLocaleLowerCase("en-US")) {
    case "webchat inbound":
      return "Học sinh nhắn tin đến";
    case "webchat outbound":
      return "Tư vấn viên đã gửi tin nhắn";
    case "connected":
      return "Đã kết nối cuộc gọi";
    case "no-answer":
      return "Không nghe máy";
    case "missed":
      return "Cuộc gọi nhỡ";
    case "callback":
      return "Cần gọi lại";
    default:
      return summary;
  }
}

function getMessageActivityLabel(channel?: string | null): string {
  switch (channel?.toLocaleLowerCase("en-US")) {
    case "zalo":
      return "Trao đổi qua Zalo";
    case "messenger":
      return "Trao đổi qua Messenger";
    case "webchat":
      return "Trao đổi trực tuyến";
    default:
      return "Trao đổi với học sinh";
  }
}

export function getInteractionStateLabel(state?: string | null): string {
  switch (state) {
    case "intent_bearing":
      return "Có tín hiệu quan tâm";
    case "no_intent":
      return "Chưa thấy tín hiệu quan tâm";
    case "unknown":
      return "Cần tư vấn viên xem xét";
    case "failed":
      return "Chưa thể phân tích";
    default:
      return "Chưa phân tích";
  }
}

export function getInteractionStateColor(
  state?: string | null,
): "gray" | "primary" | "warning" | "success" | "error" {
  switch (state) {
    case "intent_bearing":
      return "success";
    case "unknown":
      return "warning";
    case "failed":
      return "error";
    case "no_intent":
      return "gray";
    default:
      return "primary";
  }
}

export function getDirectionLabel(direction?: string | null): string {
  switch (direction) {
    case "inbound":
      return "Học sinh liên hệ";
    case "outbound":
      return "Tư vấn viên liên hệ";
    case "internal":
      return "Trao đổi nội bộ";
    default:
      return direction || "Chưa xác định chiều liên hệ";
  }
}

export function getChannelLabel(channel?: string | null): string {
  switch (channel?.toLowerCase()) {
    case "facebook":
      return "Facebook";
    case "webchat":
      return "Chat trực tuyến";
    case "email":
      return "Email";
    case "phone":
      return "Điện thoại";
    case "zalo":
      return "Zalo";
    case "messenger":
      return "Messenger";
    case "internal":
      return "Nội bộ";
    default:
      return channel || "Chưa xác định kênh";
  }
}

export function getEpisodeStateLabel(state?: string | null): string {
  return state === "open"
    ? "Đang theo dõi"
    : state === "sealed"
      ? "Đã kết thúc"
      : "Chưa xác định trạng thái";
}

export function getIntentLabel(
  semanticKey?: string | null,
  displayName?: string | null,
  termId?: string | null,
  catalog?: Map<string, IntentType>,
): string {
  return (
    displayName?.trim() ||
    (semanticKey ? catalog?.get(semanticKey)?.display_name?.trim() : null) ||
    semanticKey?.trim() ||
    termId?.trim() ||
    "Chưa xác định nhu cầu"
  );
}

export function getImportanceLabel(importance?: string | null): string | null {
  switch (importance) {
    case "Medium":
      return "Mức vừa";
    case "High":
      return "Cao";
    case "Very High":
      return "Rất cao";
    default:
      return importance?.trim() || null;
  }
}

export function getPurposeLabel(purpose?: string | null): string | null {
  switch (purpose?.toLocaleLowerCase("en-US")) {
    case "outreach":
      return "Liên hệ chủ động";
    case "conversation":
      return "Trao đổi";
    case "counseling":
      return "Tư vấn tuyển sinh";
    case "lifecycle":
      return "Cập nhật hành trình tuyển sinh";
    default:
      return purpose?.trim() || null;
  }
}

export function getDispositionLabel(
  disposition?: string | null,
): string | null {
  switch (disposition?.toLocaleLowerCase("en-US")) {
    case "sent":
      return "Đã gửi";
    case "received":
      return "Đã nhận";
    case "connected":
      return "Đã kết nối";
    case "stage_changed":
      return "Đã cập nhật giai đoạn";
    default:
      return disposition?.trim() || null;
  }
}

export function getEvidenceKindLabel(kind?: string | null): string | null {
  switch (kind?.toLocaleLowerCase("en-US")) {
    case "interaction":
      return "Trao đổi tư vấn";
    case "lifecycle_event":
      return "Cập nhật hành trình tuyển sinh";
    case "consent_event":
      return "Xác nhận quyền liên hệ";
    default:
      return kind?.trim() || null;
  }
}

export function formatScore(value?: number | null): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Chưa có";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
