/**
 * The NBA package copy is drafted server-side and can carry internal system
 * nouns ("do Frappe xác định", "Bedrock", …). The director workspace is an
 * end-user surface, so every prose/list field is passed through `scrubCopy`
 * before it is rendered — internal identifiers never reach the screen.
 */

const INTERNAL_PATTERNS: ReadonlyArray<readonly [RegExp, string]> = [
  [/\s*do\s+Frappe(?:\/[^\s.,;]+)*\s+(?:xác định|định tuyến|xác nhận)/gi, ""],
  [/\bFrappe(?:-CRM)?\b/gi, "hệ thống"],
  [/\bBedrock\b/gi, "hệ thống"],
  [/\bpackage[_ -]?seed\b/gi, "nội dung gợi ý"],
  [/\bCRM\s+Action\b/gi, "hành động"],
  [/\bdoctype\b/gi, "hồ sơ"],
  [/\bLLM\b/gi, "trợ lý AI"],
];

export function scrubCopy(value: string): string {
  let out = value;
  for (const [pattern, replacement] of INTERNAL_PATTERNS) {
    out = out.replace(pattern, replacement);
  }
  return out
    .replace(/\(\s*\)/g, "")
    .replace(/[^\S\n]{2,}/g, " ") // collapse runs of spaces/tabs, keep newlines
    .replace(/[^\S\n]+([.,;:!?])/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function scrubList(values: readonly string[] | undefined): string[] {
  if (!values) return [];
  return values.map(scrubCopy).filter((value) => value.length > 0);
}
