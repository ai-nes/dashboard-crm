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
};

export function formatAuditMetadataKey(key: string): string {
  return AUDIT_METADATA_LABELS[key] || key;
}
