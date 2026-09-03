/**
 * Evidence references arrive as internal tokens
 * (`student-context:revision:12:intent`, `score-input:revision:3:score`, …).
 * The director workspace is an end-user surface, so a raw token is never shown:
 * a known shape maps to a Vietnamese label, an unrecognised internal-looking
 * token is dropped, and already-readable text passes through.
 */

const LABELLED: ReadonlyArray<readonly [RegExp, string]> = [
  [/intent/i, "Nhu cầu quan tâm của học viên"],
  [/stage/i, "Giai đoạn hồ sơ hiện tại"],
  [/score/i, "Điểm quan tâm của học viên"],
  [/interaction|contact/i, "Lịch sử liên hệ gần đây"],
  [/deadline|application/i, "Mốc hạn hồ sơ"],
  [/analysis|claim|insight/i, "Kết quả phân tích hồ sơ 360"],
];

/** Looks like an internal identifier rather than end-user prose. */
function isInternalToken(ref: string): boolean {
  return (
    /[:]{1,2}|revision|_ref\b|\bref:|^[A-Z]{2,}-\d+$/i.test(ref) ||
    /^[a-z-]+:[a-z-]+/i.test(ref)
  );
}

export function friendlyEvidence(refs: readonly string[]): string[] {
  const out: string[] = [];
  for (const raw of refs) {
    const ref = raw.trim();
    if (!ref) continue;
    const match = LABELLED.find(([pattern]) => pattern.test(ref));
    const label = match ? match[1] : isInternalToken(ref) ? null : ref;
    if (label && !out.includes(label)) out.push(label);
  }
  return out;
}
