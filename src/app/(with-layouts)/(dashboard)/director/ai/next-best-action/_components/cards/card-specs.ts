import type { ActionType } from "../types";
import type { FieldSpec } from "./card-types";

/**
 * The end-user field set rendered for each action type, derived from the
 * `action-package:v2` registry in
 * `crm-agents/docs/action-ui-contract.md`. Pointer/identifier fields
 * (`recipientRef`, `parentRef`, `eventRef`, `templateVersion`, `packageVersion`)
 * are intentionally omitted — they are internal references, not end-user copy.
 * `desiredOutcome` is also omitted: the rationale block already renders a
 * "Kết quả mong đợi" row, and a second one here reads as a duplicate.
 */
export const CARD_SPECS: Record<ActionType, readonly FieldSpec[]> = {
  CALL: [
    { key: "opening", label: "Mở đầu cuộc gọi", kind: "prose" },
    { key: "talkingPoints", label: "Gợi ý trao đổi", kind: "list" },
    { key: "questions", label: "Câu hỏi nên hỏi", kind: "list" },
    { key: "objections", label: "Nếu học viên còn e ngại", kind: "list" },    { key: "nextStep", label: "Bước tiếp theo", kind: "prose" },
  ],
  EMAIL: [
    { key: "subject", label: "Tiêu đề email", kind: "prose" },
    { key: "body", label: "Nội dung email", kind: "prose" },
    { key: "talkingPoints", label: "Ý chính cần nêu", kind: "list" },
    { key: "questions", label: "Câu hỏi cho học viên", kind: "list" },
    { key: "cta", label: "Kêu gọi hành động", kind: "prose" },
    { key: "nextStep", label: "Bước tiếp theo", kind: "prose" },
  ],
  MESSAGE: [
    { key: "channel", label: "Kênh nhắn tin", kind: "prose" },
    { key: "opening", label: "Mở đầu tin nhắn", kind: "prose" },
    { key: "keyPoints", label: "Ý chính", kind: "list" },
    { key: "cta", label: "Kêu gọi hành động", kind: "prose" },
    { key: "nextStep", label: "Bước tiếp theo", kind: "prose" },
  ],
  COUNSELING: [
    { key: "topic", label: "Chủ đề tư vấn", kind: "prose" },
    { key: "agenda", label: "Nội dung buổi tư vấn", kind: "list" },
    { key: "guidancePoints", label: "Định hướng tư vấn", kind: "list" },
    { key: "concernsToAddress", label: "Băn khoăn cần giải đáp", kind: "list" },  ],
  MEETING: [
    { key: "purpose", label: "Mục đích cuộc gặp", kind: "prose" },
    { key: "agenda", label: "Nội dung cuộc gặp", kind: "list" },
    { key: "attendeesHint", label: "Thành phần tham gia", kind: "list" },
    { key: "prepChecklist", label: "Chuẩn bị trước", kind: "list" },  ],
  EVENT_INVITE: [
    { key: "whyRelevant", label: "Vì sao phù hợp với học viên", kind: "prose" },
    { key: "inviteMessage", label: "Lời mời", kind: "prose" },
    { key: "followUpStep", label: "Theo dõi sau sự kiện", kind: "prose" },
  ],
  CAMPUS_VISIT: [
    { key: "visitGoal", label: "Mục tiêu chuyến thăm", kind: "prose" },
    { key: "itineraryPoints", label: "Lịch trình", kind: "list" },
    { key: "logisticsNotes", label: "Lưu ý hậu cần", kind: "prose" },
    { key: "whoToInvolve", label: "Thành phần tham gia", kind: "list" },  ],
  DOCUMENT_REQUEST: [
    { key: "missingDocuments", label: "Giấy tờ còn thiếu", kind: "list" },
    { key: "deadline", label: "Hạn bổ sung", kind: "prose" },
    { key: "requestMessage", label: "Nội dung nhắc học viên", kind: "prose" },
    { key: "consequenceIfMissing", label: "Nếu thiếu quá hạn", kind: "prose" },
    { key: "followUpStep", label: "Theo dõi", kind: "prose" },
  ],
  APPLICATION_SUPPORT: [
    { key: "blockingSteps", label: "Vướng mắc đang chặn hồ sơ", kind: "list" },
    { key: "supportActions", label: "Cách hỗ trợ", kind: "list" },
    { key: "deadline", label: "Hạn nộp", kind: "prose" },  ],
  PARENT_CONTACT: [
    { key: "reason", label: "Lý do liên hệ phụ huynh", kind: "prose" },
    { key: "talkingPoints", label: "Gợi ý trao đổi", kind: "list" },
    { key: "sensitivities", label: "Điểm cần lưu ý khi trao đổi", kind: "list" },    { key: "nextStep", label: "Bước tiếp theo", kind: "prose" },
  ],
  HANDOFF: [
    { key: "toRole", label: "Chuyển tới bộ phận", kind: "prose" },
    { key: "reason", label: "Lý do chuyển tiếp", kind: "prose" },
    { key: "contextSummary", label: "Tóm tắt bối cảnh", kind: "prose" },
    { key: "openItems", label: "Việc còn dở cần tiếp nhận", kind: "list" },
    {
      key: "expectedResponseTime",
      label: "Thời gian phản hồi mong đợi",
      kind: "prose",
    },
  ],
};
