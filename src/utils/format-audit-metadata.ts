const AUDIT_METADATA_LABELS: Record<string, string> = {
  old_code: "Mã cũ",
  new_code: "Mã mới",
  duration_seconds: "Thời lượng (giây)",
  auto_routed: "Tự động phân công",
  transition_kind: "Loại chuyển trạng thái",
  continuity_kind: "Tiếp nối",
  next_action: "Hành động tiếp theo",
  old_team: "Team cũ",
  new_team: "Team mới",
  old_pool: "Pool cũ",
  new_pool: "Pool mới",
  state: "Trạng thái",
  priority: "Mức ưu tiên",
  action_owner: "Người phụ trách",
  due_at: "Hạn xử lý",
  outcome_code: "Mã kết quả",
  channel: "Kênh",
  direction: "Chiều tương tác",
};

export function formatAuditMetadataKey(key: string): string {
  if (AUDIT_METADATA_LABELS[key]) return AUDIT_METADATA_LABELS[key];

  const readableKey = key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();

  return readableKey
    ? readableKey.charAt(0).toLocaleUpperCase("vi-VN") + readableKey.slice(1)
    : key;
}
