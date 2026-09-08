import type { Coverage, FindingRef } from "@/services/api/intelligence-refs";

export default function IntelligenceTrustDisclosure({
  findings,
  coverage,
}: {
  findings: FindingRef[];
  coverage: Coverage[];
}) {
  if (findings.length === 0 && coverage.length === 0) return null;
  const available = coverage.filter((item) => item.state === "available").length;
  const stale = findings.filter((item) => item.freshness === "stale").length;
  return (
    <div className="border-t border-card-border px-5 py-3 text-xs text-text-tertiary" aria-label="Độ tin cậy dữ liệu AI">
      {findings.length} phát hiện có định danh · phạm vi dữ liệu: {available}/{coverage.length} phần sẵn sàng
      {stale > 0 ? ` · ${stale} phát hiện đã cũ` : ""}
    </div>
  );
}
